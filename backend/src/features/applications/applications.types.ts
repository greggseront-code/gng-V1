export interface Application {
  id: number;
  offer_id: number;
  student_id: number;
  selected: number; // 0 or 1 (SQLite boolean)
  created_at: string;
}
