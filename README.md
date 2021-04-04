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

## デプロイ

1. Step 1: Run `sls alexa auth` to authenticate
2. Step 2: Run `sls alexa create --name "Serverless Alexa Typescript" --locale ja-JP --type custom` to create a new skill
3. `sls deploy`
4. `sls alexa update`
5. `sls alexa build`
