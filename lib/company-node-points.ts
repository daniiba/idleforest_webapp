type AdminClient = {
    from: (table: string) => any
}

type CompanyMembership = {
    id: string
    company_id: string
    user_id: string
    status: 'active' | 'left' | 'switched'
    joined_at: string
    left_at: string | null
    generated_points_final: number | null
}

type CompanyNode = {
    user_id: string | null
    node_identifier: string | null
    total_requests: number | null
}

type CompanyMembershipNodeBaseline = {
    membership_id: string
    node_identifier: string
    baseline_total_requests: number | null
    final_total_requests?: number | null
}

export type CompanyGeneratedPointStats = {
    memberCount: number
    totalMemberCount: number
    generatedPoints: number
    memberUserIds: string[]
}

function baselineKey(membershipId: string, nodeIdentifier: string) {
    return `${membershipId}:${nodeIdentifier}`
}

async function getActiveMembership(admin: AdminClient, userId: string): Promise<CompanyMembership | null> {
    const { data, error } = await admin
        .from('company_memberships')
        .select('id, company_id, user_id, status, joined_at, left_at, generated_points_final')
        .eq('user_id', userId)
        .is('left_at', null)
        .maybeSingle()

    if (error) {
        console.error('Active company membership lookup failed', error)
        return null
    }

    return data as CompanyMembership | null
}

export async function createCompanyMembershipForUser(admin: AdminClient, companyId: string, userId: string) {
    const activeMembership = await getActiveMembership(admin, userId)
    if (activeMembership?.company_id === companyId) {
        return activeMembership
    }

    const { data, error } = await admin
        .from('company_memberships')
        .insert({
            company_id: companyId,
            user_id: userId,
            status: 'active',
            joined_at: new Date().toISOString(),
        })
        .select('id, company_id, user_id, status, joined_at, left_at, generated_points_final')
        .single()

    if (error) {
        console.error('Company membership create failed', error)
        return null
    }

    await snapshotCompanyMembershipNodeBaselines(admin, data.id, userId)

    return data as CompanyMembership
}

export async function snapshotCompanyMembershipNodeBaselines(admin: AdminClient, membershipId: string, userId: string) {
    const { data: nodes, error: nodesError } = await admin
        .from('nodes')
        .select('user_id, node_identifier, total_requests')
        .eq('user_id', userId)

    if (nodesError) {
        console.error('Company membership node baseline lookup failed', nodesError)
        return
    }

    const baselineRows = ((nodes || []) as CompanyNode[])
        .filter((node) => node.node_identifier)
        .map((node) => ({
            membership_id: membershipId,
            node_identifier: node.node_identifier,
            baseline_total_requests: Math.max(0, node.total_requests || 0),
        }))

    if (baselineRows.length === 0) return

    const { error: insertError } = await admin
        .from('company_membership_node_baselines')
        .upsert(baselineRows, {
            onConflict: 'membership_id,node_identifier',
            ignoreDuplicates: true,
        })

    if (insertError) {
        console.error('Company membership node baseline snapshot failed', insertError)
    }
}

export async function finalizeActiveCompanyMembershipForUser(admin: AdminClient, userId: string, status: 'left' | 'switched' = 'switched') {
    const membership = await getActiveMembership(admin, userId)
    if (!membership) return null

    const { data: baselines, error: baselinesError } = await admin
        .from('company_membership_node_baselines')
        .select('membership_id, node_identifier, baseline_total_requests, final_total_requests')
        .eq('membership_id', membership.id)

    if (baselinesError) {
        console.error('Company membership baseline lookup failed', baselinesError)
        return null
    }

    const baselineRows = (baselines || []) as CompanyMembershipNodeBaseline[]
    const nodeIds = baselineRows.map((baseline) => baseline.node_identifier).filter(Boolean)
    const nodeTotals = new Map<string, number>()

    if (nodeIds.length > 0) {
        const { data: nodes, error: nodesError } = await admin
            .from('nodes')
            .select('node_identifier, total_requests')
            .in('node_identifier', nodeIds)

        if (nodesError) {
            console.error('Company membership finalize node lookup failed', nodesError)
        } else {
            for (const node of (nodes || []) as Array<{ node_identifier: string | null; total_requests: number | null }>) {
                if (node.node_identifier) {
                    nodeTotals.set(node.node_identifier, Math.max(0, node.total_requests || 0))
                }
            }
        }
    }

    let generatedPoints = 0
    const finalBaselineRows = baselineRows.map((baseline) => {
        const finalTotal = nodeTotals.get(baseline.node_identifier) ?? Math.max(0, baseline.final_total_requests || baseline.baseline_total_requests || 0)
        generatedPoints += Math.max(0, finalTotal - Math.max(0, baseline.baseline_total_requests || 0))

        return {
            membership_id: membership.id,
            node_identifier: baseline.node_identifier,
            baseline_total_requests: Math.max(0, baseline.baseline_total_requests || 0),
            final_total_requests: finalTotal,
        }
    })

    if (finalBaselineRows.length > 0) {
        const { error: baselineUpdateError } = await admin
            .from('company_membership_node_baselines')
            .upsert(finalBaselineRows, {
                onConflict: 'membership_id,node_identifier',
            })

        if (baselineUpdateError) {
            console.error('Company membership final baseline update failed', baselineUpdateError)
        }
    }

    const now = new Date().toISOString()
    const { data: updatedMembership, error: updateError } = await admin
        .from('company_memberships')
        .update({
            status,
            left_at: now,
            generated_points_final: generatedPoints,
            updated_at: now,
        })
        .eq('id', membership.id)
        .select('id, company_id, user_id, status, joined_at, left_at, generated_points_final')
        .single()

    if (updateError) {
        console.error('Company membership finalize failed', updateError)
        return null
    }

    return updatedMembership as CompanyMembership
}

export async function getCompanyGeneratedPointStats(admin: AdminClient, companyId: string): Promise<CompanyGeneratedPointStats> {
    const { data: memberships, error: membershipsError } = await admin
        .from('company_memberships')
        .select('id, company_id, user_id, status, joined_at, left_at, generated_points_final')
        .eq('company_id', companyId)

    if (membershipsError) {
        console.error('Company membership lookup failed', membershipsError)
        return { memberCount: 0, totalMemberCount: 0, generatedPoints: 0, memberUserIds: [] }
    }

    const companyMemberships = (memberships || []) as CompanyMembership[]
    if (companyMemberships.length === 0) {
        return { memberCount: 0, totalMemberCount: 0, generatedPoints: 0, memberUserIds: [] }
    }

    const membershipIds = companyMemberships.map((membership) => membership.id)
    const activeMemberships = companyMemberships.filter((membership) => !membership.left_at && membership.status === 'active')
    const activeUserIds = activeMemberships.map((membership) => membership.user_id).filter(Boolean)

    const { data: baselines, error: baselinesError } = await admin
        .from('company_membership_node_baselines')
        .select('membership_id, node_identifier, baseline_total_requests, final_total_requests')
        .in('membership_id', membershipIds)

    if (baselinesError) {
        console.error('Company membership baseline lookup failed', baselinesError)
        return {
            memberCount: activeMemberships.length,
            totalMemberCount: companyMemberships.length,
            generatedPoints: 0,
            memberUserIds: activeUserIds,
        }
    }

    const baselineRows = (baselines || []) as CompanyMembershipNodeBaseline[]
    const activeNodeIds = baselineRows
        .filter((baseline) => activeMemberships.some((membership) => membership.id === baseline.membership_id))
        .map((baseline) => baseline.node_identifier)
        .filter(Boolean)

    const nodeTotals = new Map<string, number>()
    if (activeNodeIds.length > 0) {
        const { data: nodes, error: nodesError } = await admin
            .from('nodes')
            .select('node_identifier, total_requests')
            .in('node_identifier', Array.from(new Set(activeNodeIds)))

        if (nodesError) {
            console.error('Company node lookup failed', nodesError)
        } else {
            for (const node of (nodes || []) as Array<{ node_identifier: string | null; total_requests: number | null }>) {
                if (node.node_identifier) {
                    nodeTotals.set(node.node_identifier, Math.max(0, node.total_requests || 0))
                }
            }
        }
    }

    const baselinesByMembership = new Map<string, CompanyMembershipNodeBaseline[]>()
    for (const baseline of baselineRows) {
        const rows = baselinesByMembership.get(baseline.membership_id) || []
        rows.push(baseline)
        baselinesByMembership.set(baseline.membership_id, rows)
    }

    const generatedPoints = companyMemberships.reduce((sum, membership) => {
        if (membership.left_at || membership.status !== 'active') {
            return sum + Math.max(0, membership.generated_points_final || 0)
        }

        const membershipBaselines = baselinesByMembership.get(membership.id) || []
        const activePoints = membershipBaselines.reduce((membershipSum, baseline) => {
            const currentTotal = nodeTotals.get(baseline.node_identifier) || 0
            return membershipSum + Math.max(0, currentTotal - Math.max(0, baseline.baseline_total_requests || 0))
        }, 0)

        return sum + activePoints
    }, 0)

    return {
        memberCount: activeMemberships.length,
        totalMemberCount: companyMemberships.length,
        generatedPoints,
        memberUserIds: activeUserIds,
    }
}
