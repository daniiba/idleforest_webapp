import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Annual Report & Analytics | IdleForest",
    description:
        "View IdleForest's annual report and live analytics — trees planted, active users, bandwidth shared, and revenue generated for reforestation projects worldwide.",
    openGraph: {
        title: "Annual Report & Analytics | IdleForest",
        description:
            "View IdleForest's annual report and live analytics — trees planted, active users, bandwidth shared, and revenue generated for reforestation projects worldwide.",
    },
};

export default function ReportLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
