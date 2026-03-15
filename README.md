# Portfolio Portal

複数ユーザーが自分のポートフォリオを登録・管理できるプラットフォーム。

## 技術スタック

| 層 | 技術 |
|---|---|
| フロントエンド | Vite + React (SPA) + shadcn/ui + Tailwind CSS |
| バックエンド API | Hono (Cloudflare Workers) |
| データベース | Supabase (PostgreSQL) |
| 認証 / SSO | Clerk |
| ORM | Drizzle ORM |
| デプロイ | Cloudflare Pages + Workers |
| パッケージ管理 | pnpm (workspaces) |

## プロジェクト構成

```
portfolioPortal/
├── Dockerfile.dev          # 開発用 Docker イメージ（node:20-slim / glibc ベース）
├── docker-compose.yml      # ui / api の開発環境定義
├── Makefile                # 開発コマンド
├── package.json            # ルート（pnpm workspace 設定）
├── pnpm-workspace.yaml     # ワークスペース対象ディレクトリ
├── tsconfig.base.json      # 共通 TypeScript 設定
│
├── ui/                     # フロントエンド（Vite + React SPA）
│   ├── src/
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── index.html
│   ├── vite.config.ts      # /api へのプロキシ設定あり
│   └── package.json
│
├── api/                    # バックエンド（Hono + Cloudflare Workers）
│   ├── src/
│   │   └── index.ts
│   ├── wrangler.toml       # Cloudflare Workers 設定
│   └── package.json
│
└── packages/
    └── types/              # ui / api 共有の型定義
        └── src/
            └── index.ts
```

## 開発環境の起動

### 必要なもの

- Docker
- make

### コマンド

```bash
make dev    # 起動（初回はイメージをビルド）
make down   # 停止
make logs   # ログ確認
make build  # イメージのみビルド
```

### アクセス先

| サービス | URL |
|---|---|
| UI | http://localhost:5173 |
| API | http://localhost:8787 |
| API ヘルスチェック | http://localhost:8787/api/health |

## データベース

| 環境 | 使用DB | 接続先 |
|---|---|---|
| ローカル開発 | PostgreSQL コンテナ | `localhost:5432` |
| 本番 | Supabase (PostgreSQL) | `.env` の `DATABASE_URL` |

ローカルでは `docker compose up` 時に自動的に PostgreSQL が起動します。
DB への直接接続が必要な場合は `localhost:5432`（user: `postgres` / pass: `postgres` / db: `portfolio_portal`）。

## UIデザイン方針

- **コンポーネント**: [shadcn/ui](https://ui.shadcn.com/)（Radix UI + Tailwind CSS）
- **スタイル**: Tailwind CSS。GitHubライクなダーク系テーマ
- **i18n**: react-i18next による日本語 / 英語切り替え対応

## パッケージ追加時

新しい npm パッケージを追加した場合は Docker イメージの再ビルドが必要。

```bash
# 例: ui に shadcn/ui を追加
pnpm --filter ui add @shadcn/ui

make build  # イメージ再ビルド
make dev
```
