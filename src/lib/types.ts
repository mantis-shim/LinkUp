export interface Activity {
    id: number;
    name: string;
    description: string | null;
    location: string | null;
    image_src: string | null;
    creator_id: number;
    first_name: string | null;
    last_name: string | null;
    category_id: number;
    created_at: string;
    starts_at: string | null;
    gender_id: number | null;
}
