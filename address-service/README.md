# デプロイ手順

1. フォルダ内に `.aws.credentials`ファイルを作成し、認証情報を記載
2. Docker起動
  ```$ sh docker-run.sh`
3. docker内でパッケージをインストール
  `$ npm i --build-from-source`
4. パッチ適用
  `$ npm run postinstall`
5. デプロイ
  `$ sls deploy`
