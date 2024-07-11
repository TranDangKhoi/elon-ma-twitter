I've also commented some stuff in the code itself (some are in Vietnamese, some are in English, i'm sorry), so in this markdown I'll just explain about some confusing stuffs for future Khoi 🤓 if he'll ever be coming back to update this project

### 1\. About this route/:tweet_id/children

Although you see that I'm naming the first segment /:tweet_id, but this api also return comments not only retweets and quote tweets. Because comments in this project are actually also counted as tweets

### 2\. Uhhh, the HLS Video feature is not even half done yet, if future Khoi has time, please update it, cuz present Khoi is too lazy

### 3\. If any accounts are banned, it will be determined by the UserVerifyStatus in enums. If verify status = 2, then that means the account is banned from the platform

### 4\. MongoDB's updates operator explanation

- $set: Set the value of a field in a document.
- $unset: Remove the specified field from a document.
- $inc: Increment the value of the field by the specified amount.
- $in: This one is used for filtering documents, if you passed in this filter, it will only update the documents that match the filter
- $push: Add an item to an array.
- $pushAll: Add several items to an array.
- $addToSet: Add an item to an array only if it is not in the array already.
- $pop: Remove the first or last item of an array.
- $pull: Remove all array elements that match a specified query.
- $pullAll: Remove several items from an array.
- $currentDate: Set the value of a field to current date, either as a Date or a Timestamp.
- $bit: Perform bitwise AND, OR, or XOR updates on an integer field.
- $isolated: Modifies behavior of write operations to return the document before modifications.
- $min: Only update the field if the specified value is less than the existing field value.
