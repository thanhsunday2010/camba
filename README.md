# Camba — Luyện thi Cambridge K12



Ứng dụng web luyện thi Tiếng Anh Cambridge cho học sinh K12 với **AI chấm sửa Writing & Speaking**.



## Tính năng



- Luyện thi **YLE** (Starters, Movers, Flyers) và **Secondary** (KET, PET, FCE)

- Chấm tự động Reading/Listening

- **AI chấm Writing** theo rubric Cambridge (**Google Gemini 1.5 Flash/Pro**)

- **AI chấm Speaking** — Web Speech API (miễn phí) + Gemini feedback

- Dashboard tiến độ, streak, bảng xếp hạng

- Admin quản lý ngân hàng câu hỏi

- Dashboard giáo viên giao bài tập



## Tech stack



- Next.js 15 (App Router) + TypeScript

- PostgreSQL + Prisma

- NextAuth.js v5

- **Google AI Studio (Gemini 1.5 Flash/Pro)** — writing, speaking, explain

- **Web Speech API** — speech-to-text $0 on browser

- Tailwind CSS + shadcn/ui



## Cài đặt



### 1. Yêu cầu



- Node.js 18+

- Docker (cho PostgreSQL) hoặc PostgreSQL có sẵn

- Chrome hoặc Edge (khuyến nghị cho Web Speech API)



### 2. Khởi động database



```bash

docker compose up -d

```



### 3. Cấu hình môi trường



```bash

cp .env.example .env

```



Chỉnh sửa `.env`:

- `DATABASE_URL` — connection string PostgreSQL

- `AUTH_SECRET` — chuỗi ngẫu nhiên ≥ 32 ký tự

- `GOOGLE_AI_API_KEY` — lấy miễn phí tại [Google AI Studio](https://aistudio.google.com/apikey)



### 4. Cài dependencies & migrate



```bash

npm install

npx prisma migrate dev --name init

npm run db:seed

```



### 5. Chạy dev server



```bash

npm run dev

```



Mở [http://localhost:3000](http://localhost:3000)



## AI & chi phí MVP ($0 testing)



### Writing / giải thích câu sai



Dùng **Gemini** qua `GOOGLE_AI_API_KEY`. Mặc định model rẻ nhất:



```env

GEMINI_MODEL_WRITING=gemini-1.5-flash

GEMINI_MODEL_EXPLAIN=gemini-1.5-flash

```



Muốn chất lượng cao hơn khi test Writing:



```env

GEMINI_MODEL_WRITING=gemini-1.5-pro

```



### Speaking — Speech-to-text



**Khuyến nghị (mặc định, $0):** Web Speech API trên trình duyệt



```env

SPEECH_TO_TEXT_MODE=browser

```



Luồng: học sinh bấm "Bắt đầu nói" → trình duyệt chuyển giọng nói thành text → gửi transcript lên server → **Gemini chấm Speaking**.



- Hoạt động tốt trên **Chrome / Edge**

- Không tốn API cho bước STT

- Fallback: nhập transcript thủ công



**Tuỳ chọn:** nếu trình duyệt không hỗ trợ mic/STT, bật Gemini transcribe audio:



```env

SPEECH_TO_TEXT_MODE=gemini

GEMINI_MODEL_AUDIO=gemini-1.5-flash

```



Khi đó client có thể upload file audio; server dùng Gemini multimodal để transcribe (dùng quota AI Studio free tier).



## Tài khoản demo (sau seed)



| Role | Email | Password |

|------|-------|----------|

| Admin | admin@camba.vn | admin123 |

| Teacher | teacher@camba.vn | teacher123 |

| Student | student@camba.vn | student123 |



## Deploy (Vercel + Neon)



1. Tạo database trên [Neon](https://neon.tech) hoặc Supabase

2. Deploy lên Vercel, set env vars: `DATABASE_URL`, `AUTH_SECRET`, `NEXTAUTH_URL`, `GOOGLE_AI_API_KEY`

3. Chạy migration: `npx prisma migrate deploy`

4. Seed production: `npm run db:seed`



## Cấu trúc chính



```

src/

├── lib/ai/

│   ├── config.ts      # Gemini models, STT mode

│   ├── gemini.ts      # Google AI Studio client

│   ├── grading.ts     # Writing/Speaking/explain

│   └── prompts.ts

├── components/exam/

│   └── audio-recorder.tsx  # Web Speech API STT

└── app/api/ai/        # grade-writing, grade-speaking

```



## Giới hạn AI



- 10 lượt chấm AI / ngày / học sinh (free tier)

- Writing tối đa 5000 ký tự



## Lưu ý



Nội dung đề bài được soạn theo **format inspired by Cambridge**, không phải đề thi chính thức có bản quyền.

