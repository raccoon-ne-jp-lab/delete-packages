# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 開発コマンド

### ビルド
```bash
# TypeScriptをコンパイルし、distディレクトリにバンドル
npm run build  # format-check、lint-check、test、tscを実行
npm run pack   # libとdistを削除後、buildを実行してncc buildでバンドル
```

### テスト
```bash
# Jestテストを実行
npm test

# 特定のテストファイルを実行
npx jest __tests__/delete.test.ts
npx jest __tests__/version/get-version.test.ts
```

### リント・フォーマット
```bash
# Prettier
npm run format        # すべての.tsファイルをフォーマット
npm run format-check  # フォーマットチェックのみ

# ESLint
npm run lint        # src/**/*.tsをリント＆修正
npm run lint-check  # リントチェックのみ
```

## アーキテクチャ

このGitHub Actionは、GitHub Packagesから指定条件に基づいてパッケージバージョンを削除する機能を提供します。

### 主要コンポーネント

#### エントリポイント
- `src/main.ts`: アクションのエントリポイント。入力パラメータを解析し、削除処理を開始

#### コア機能
- `src/input.ts`: 入力パラメータの定義と検証
  - `Input`クラス: アクション入力のバリデーションとデフォルト値管理
  - 削除対象の判定ロジック（pre-release、untagged、retention-days等）

- `src/delete.ts`: バージョン削除の主要ロジック
  - `deleteVersions()`: メインの削除処理フロー
  - `getVersionIds()`: 削除対象バージョンIDの取得
  - `finalIds()`: 最終的な削除対象IDリストの決定
  - RxJSを使用した非同期処理管理
  - 一度に削除できるバージョン数は100個まで（RATE_LIMIT）

#### バージョン管理 (`src/version/`)
- `get-versions.ts`: GitHub APIを使用したパッケージバージョン情報の取得
- `delete-version.ts`: 実際のバージョン削除処理
- `index.ts`: バージョン関連機能のエクスポート

### 削除戦略の組み合わせ

以下の削除戦略が利用可能（排他的な組み合わせあり）：
1. 最も古いN個のバージョンを削除 (`num-old-versions-to-delete`)
2. 最新N個を残して削除 (`min-versions-to-keep`)
3. プレリリース版のみ削除 (`delete-only-pre-release-versions`)
4. タグなしバージョンのみ削除（コンテナパッケージ限定）
5. 指定日数より古いバージョンを削除 (`retention-days`)
6. 正規表現でバージョンを除外 (`ignore-versions`)

### 技術スタック
- TypeScript（ES6ターゲット、CommonJSモジュール）
- RxJS: 非同期処理とストリーム管理
- GitHub Actions SDK: `@actions/core`、`@actions/github`
- Octokit REST API: GitHub APIクライアント
- Jest: テストフレームワーク（MSWでAPIモック）
- ncc: Node.jsアプリケーションのバンドル

## 重要な制約
- 一度の実行で最大100バージョンまで削除可能
- `num-old-versions-to-delete > 1`の場合、他の削除オプションとの併用不可
- コンテナパッケージ以外では`delete-only-untagged-versions`は無視される