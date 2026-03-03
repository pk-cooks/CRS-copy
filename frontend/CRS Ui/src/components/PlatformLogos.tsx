/**
 * Inline SVG platform logos for CourseDetailPage.
 * These replace the thumbnail image in the video container.
 */

export const CourseraLogo = ({ className = "" }: { className?: string }) => (
    <svg className={className} viewBox="0 0 200 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <text x="100" y="34" textAnchor="middle" fontFamily="Inter, system-ui, sans-serif" fontWeight="700" fontSize="32" fill="white">
            Coursera
        </text>
    </svg>
);

export const UdemyLogo = ({ className = "" }: { className?: string }) => (
    <svg className={className} viewBox="0 0 200 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <text x="100" y="34" textAnchor="middle" fontFamily="Inter, system-ui, sans-serif" fontWeight="700" fontSize="32" fill="white">
            Udemy
        </text>
    </svg>
);

export const EdxLogo = ({ className = "" }: { className?: string }) => (
    <svg className={className} viewBox="0 0 200 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <text x="100" y="34" textAnchor="middle" fontFamily="Inter, system-ui, sans-serif" fontWeight="700" fontSize="32" fill="white">
            edX
        </text>
    </svg>
);

export const DefaultPlatformLogo = ({ className = "", name = "Online" }: { className?: string; name?: string }) => (
    <svg className={className} viewBox="0 0 200 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <text x="100" y="34" textAnchor="middle" fontFamily="Inter, system-ui, sans-serif" fontWeight="700" fontSize="28" fill="white">
            {name}
        </text>
    </svg>
);

/**
 * Returns the appropriate platform logo component for a given platform name,
 * along with its brand color for the background.
 */
export function getPlatformLogo(platform: string) {
    const p = platform.toLowerCase();
    if (p.includes("coursera")) {
        return { Logo: CourseraLogo, bgColor: "#0056D2" };
    }
    if (p.includes("udemy")) {
        return { Logo: UdemyLogo, bgColor: "#A435F0" };
    }
    if (p.includes("edx")) {
        return { Logo: EdxLogo, bgColor: "#02262B" };
    }
    return {
        Logo: (props: { className?: string }) => <DefaultPlatformLogo {...props} name={platform} />,
        bgColor: "#6C63FF",
    };
}
