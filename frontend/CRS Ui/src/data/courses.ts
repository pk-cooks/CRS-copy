// Static course data used by DashboardPage and MyCoursesPage
// These are display-only fallback courses shown in the dashboard

export interface StaticCourse {
    id: number;
    title: string;
    platform: string;
    level: string;
    description: string;
    rating: number;
    url: string;
}

export const allCourses: StaticCourse[] = [
    {
        id: 1,
        title: "Machine Learning Specialization",
        platform: "Coursera",
        level: "Specialization",
        description: "Master fundamental AI concepts and develop practical machine learning skills.",
        rating: 4.9,
        url: "https://www.coursera.org/specializations/machine-learning-introduction",
    },
    {
        id: 2,
        title: "Deep Learning Specialization",
        platform: "Coursera",
        level: "Specialization",
        description: "Become a Machine Learning expert. Master the fundamentals of deep learning.",
        rating: 4.9,
        url: "https://www.coursera.org/specializations/deep-learning",
    },
    {
        id: 3,
        title: "The Complete Python Bootcamp",
        platform: "Udemy",
        level: "Course",
        description: "Learn Python from beginner to advanced with projects.",
        rating: 4.59,
        url: "https://www.udemy.com/course/complete-python-bootcamp/",
    },
    {
        id: 4,
        title: "Complete Web Development Bootcamp",
        platform: "Udemy",
        level: "Course",
        description: "Become a full-stack web developer with just one course.",
        rating: 4.67,
        url: "https://www.udemy.com/course/the-complete-web-development-bootcamp/",
    },
    {
        id: 5,
        title: "Data Science Fundamentals with Python and SQL",
        platform: "Coursera",
        level: "Specialization",
        description: "Build the Foundation for your Data Science career with Python and SQL.",
        rating: 4.6,
        url: "https://www.coursera.org/specializations/data-science-fundamentals-python-sql",
    },
    {
        id: 6,
        title: "100 Days of Code: Python Pro Bootcamp",
        platform: "Udemy",
        level: "Course",
        description: "Master Python by building 100 projects in 100 days.",
        rating: 4.69,
        url: "https://www.udemy.com/course/100-days-of-code/",
    },
    {
        id: 7,
        title: "CS50's Introduction to Computer Science",
        platform: "edX",
        level: "Course",
        description: "Harvard University's introduction to computer science.",
        rating: 4.9,
        url: "https://www.edx.org/course/introduction-to-computer-science-harvardx-cs50x",
    },
    {
        id: 8,
        title: "Docker Mastery: with Kubernetes + Swarm",
        platform: "Udemy",
        level: "Course",
        description: "Build, test, deploy containers with Docker and Kubernetes.",
        rating: 4.66,
        url: "https://www.udemy.com/course/docker-mastery/",
    },
];

export function levelColor(level: string): string {
    switch (level) {
        case "Beginner":
            return "bg-emerald-50 text-emerald-700 border-emerald-200";
        case "Intermediate":
            return "bg-amber-50 text-amber-700 border-amber-200";
        case "Advanced":
            return "bg-rose-50 text-rose-700 border-rose-200";
        case "Specialization":
            return "bg-blue-50 text-blue-700 border-blue-200";
        case "Course":
            return "bg-purple-50 text-purple-700 border-purple-200";
        case "Certificate":
            return "bg-teal-50 text-teal-700 border-teal-200";
        default:
            return "bg-muted text-muted-foreground";
    }
}
