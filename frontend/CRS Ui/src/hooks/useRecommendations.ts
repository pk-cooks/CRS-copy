import { useState, useEffect, useCallback } from "react";
import * as api from "@/services/api";
import type { BackendCourse } from "@/services/api";

export interface NormalizedCourse {
    id: number;
    title: string;
    platform: string;
    level: string;
    description: string;
    reason: string;
    rating: number;
    isTop: boolean;
    skills: string[];
    category: string;
    url: string;
    thumbnail: string;
}

function normalize(raw: BackendCourse, index: number): NormalizedCourse {
    const platform = (raw["Site"] as string) || (raw["Category"] as string) || "Online";
    return {
        id: index + 1,
        title: (raw["Title"] as string) || (raw["Course Name"] as string) || "Untitled Course",
        platform: platform,
        level: (raw["Course Type"] as string) || (raw["Level"] as string) || "All Levels",
        description:
            (raw["Short Intro"] as string) ||
            (raw["Course Description"] as string) ||
            (raw["Sub-Category"] as string) ||
            "",
        reason: `Matches your interest in ${(raw["Sub-Category"] as string) || "this topic"}`,
        rating: typeof raw["Rating"] === "number" ? raw["Rating"] : 4.5,
        isTop: index < 3,
        skills: raw["Skills"]
            ? String(raw["Skills"])
                .split(",")
                .map((s) => s.trim())
                .filter(Boolean)
            : [],
        category: (raw["Sub-Category"] as string) || "",
        url: (raw["URL"] as string) || (raw["Course URL"] as string) || "#",
        thumbnail: generateThumbnailUrl(platform),
    };
}

function generateThumbnailUrl(platform: string): string {
    // Generate platform-specific thumbnail placeholder
    const platformLower = platform.toLowerCase();
    const baseColor = platformLower.includes("coursera")
        ? "0066CC"
        : platformLower.includes("udemy")
        ? "EC5252"
        : platformLower.includes("edx")
        ? "02262B"
        : "6C63FF";

    return `https://via.placeholder.com/320x180/${baseColor}/FFFFFF?text=${encodeURIComponent(platform)}`;
}

export function useRecommendations(userid: number | null) {
    const [courses, setCourses] = useState<NormalizedCourse[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchRecommendations = useCallback(async () => {
        if (userid === null) return;
        setLoading(true);
        setError(null);
        try {
            const raw = await api.getRecommendations(userid);
            setCourses(raw.map(normalize));
        } catch (err) {
            console.error("Failed to fetch recommendations:", err);
            setError(
                err instanceof Error ? err.message : "Failed to load recommendations"
            );
            setCourses([]);
        } finally {
            setLoading(false);
        }
    }, [userid]);

    useEffect(() => {
        fetchRecommendations();
    }, [fetchRecommendations]);

    return { courses, loading, error, refetch: fetchRecommendations };
}
