CREATE TABLE IF NOT EXISTS statuses (
    id SERIAL PRIMARY KEY,
    name VARCHAR NOT NULL,
    theme_color VARCHAR NOT NULL
);

INSERT INTO statuses (id, name, theme_color) VALUES
(1, '未着手', '#6b7280'),
(2, '進行中', '#3b82f6'),
(3, '完了',   '#10b981');

CREATE TABLE IF NOT EXISTS clients (
    id SERIAL PRIMARY KEY,
    name VARCHAR NOT NULL
);

INSERT INTO clients (id, name) VALUES
(1, '株式会社ABC'),
(2, '株式会社XYZ'),
(3, '合同会社DEF'),
(4, '株式会社GHI'),
(5, '個人事業主 山田');

CREATE TABLE IF NOT EXISTS phases (
    id SERIAL PRIMARY KEY,
    name VARCHAR NOT NULL
);

INSERT INTO phases (id, name) VALUES
(1, '要件定義'),
(2, '設計'),
(3, '開発'),
(4, '社内テスト'),
(5, '受入テスト'),
(6, 'リリース');

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR NOT NULL,
    display_name VARCHAR NOT NULL,
    email VARCHAR NOT NULL,
    hashed_password VARCHAR NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

INSERT INTO users (id, username, display_name, email, hashed_password) VALUES
(1, 'tanaka_taro',   '田中 太郎', 'tanaka.taro@example.com',   'dummy'),
(2, 'sato_hanako',   '佐藤 花子', 'sato.hanako@example.com',   'dummy'),
(3, 'suzuki_ichiro', '鈴木 一郎', 'suzuki.ichiro@example.com', 'dummy'),
(4, 'inoue_akiko',   '井上 明子', 'inoue.akiko@example.com',   'dummy'),
(5, 'shimizu_jiro',  '清水 二郎', 'shimizu.jiro@example.com',  'dummy');


CREATE TABLE IF NOT EXISTS cases (
    id SERIAL PRIMARY KEY,
    title VARCHAR NOT NULL,
    client_id INTEGER REFERENCES clients(id),
    assignee_id INTEGER REFERENCES users(id),
    status_id INTEGER REFERENCES statuses(id),
    order_amount DECIMAL(10, 2),
    progress_phase_id INTEGER REFERENCES phases(id),
    due_date DATE,
    phase_due_date DATE,
    description VARCHAR,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

INSERT INTO cases (title, client_id, assignee_id, status_id, order_amount, progress_phase_id, due_date, description) VALUES
('ECサイトリニューアル',   1, 1, 2, 1000000, 3, '2026-04-30', 'トップページのデザイン刷新'),
('社内システム導入支援',   2, 2, 2, 2000000, 1, '2026-05-15', '要件定義フェーズ'),
('モバイルアプリ開発',     3, 3, 2, 3000000, 3, '2026-06-30', 'iOS/Android対応'),
('データ分析基盤構築',     4, 1, 3, 4000000, 6, '2026-03-31', 'BIツール導入済み'),
('LP制作',                 5, 2, 1, 5000000, NULL, '2026-03-15', '予算折り合わず');

CREATE TABLE IF NOT EXISTS case_files (
    id SERIAL PRIMARY KEY,
    case_id INTEGER REFERENCES cases(id) ON DELETE CASCADE,
    filename VARCHAR NOT NULL,
    original_name VARCHAR NOT NULL,
    file_size INTEGER NOT NULL,
    mime_type VARCHAR NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

SELECT setval('clients_id_seq', (SELECT MAX(id) FROM clients));
SELECT setval('users_id_seq', (SELECT MAX(id) FROM users));
SELECT setval('statuses_id_seq', (SELECT MAX(id) FROM statuses));
SELECT setval('phases_id_seq', (SELECT MAX(id) FROM phases));
SELECT setval('cases_id_seq', (SELECT MAX(id) FROM cases));
