I've also commented some stuff in the code itself (some are in Vietnamese, some are in English, i'm sorry), so in this markdown I'll just explain about some confusing stuffs for future Khoi 🤓 if he'll ever be coming back to update this project

### 1\. About this route/:tweet_id/children

Although you see that I'm naming the first segment /:tweet_id, but this api also return comments not only retweets and quote tweets. Because comments in this project are actually also counted as tweets

### 2\. Uhhh, the HLS Video feature is not even half done yet, if future Khoi has time, please update it, cuz present Khoi is too lazy

### 3\. If any accounts are banned, it will be determined by the UserVerifyStatus in enums. If verify status = 2, then that means the account is banned from the platform
