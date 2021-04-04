# alexa custom skill

## フォルダ構成

- address-service
  住所の正規化サービス、デプロイにDockerが必要
- alexa-service
  メインフォルダ、alexa skillのビルドとlambdaへのデプロイ
- config
  環境変数を扱うフォルダ
- resource-service
  S3などのインフラの定義

## 初回デプロイ

1. `cd resource-service`
2. `yarn`
3. `sls deploy --stage dev`
4. `cd ../alexa-service`
5. `yarn`
6. `sls alexa auth`
7. `sls alexa create --name "your alexa skill name" --locale ja-JP --type custom` to create a new skill
8. `sls deploy --stage dev`
9. `sls alexa update`
10. `sls alexa build`
