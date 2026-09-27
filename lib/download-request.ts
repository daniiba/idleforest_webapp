export function isSpeculativeNavigation(request: Request) {
    const headers = request.headers
    const purpose = `${headers.get('purpose') || ''} ${headers.get('sec-purpose') || ''}`.toLowerCase()

    return headers.get('next-router-prefetch') === '1'
        || headers.get('x-middleware-prefetch') === '1'
        || purpose.includes('prefetch')
}
