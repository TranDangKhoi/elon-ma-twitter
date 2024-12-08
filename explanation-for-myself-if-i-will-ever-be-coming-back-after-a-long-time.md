I've also commented some stuff in the code itself (some are in Vietnamese, some are in English, i'm sorry), so in this markdown I'll just explain about some confusing stuffs for future Khoi 🤓 if he'll ever be coming back to update this project

### 1\. About this route/:tweet_id/children

Although you see that I'm naming the first segment /:tweet_id, but this api also return comments not only retweets and quote tweets. Because comments in this project are actually also counted as tweets

### 2\. Uhhh, the HLS Video feature is not even half done yet, if future Khoi has time, please update it, cuz present Khoi is too lazy

### 3\. If any accounts are banned, it will be determined by the UserVerifyStatus in enums. If verify status = 2, then that means the account is banned from the platform

### 4\. The route GET /tweets/:tweet_id is to check if that tweet is bookmarked by the current user or not.

### 5\. MongoDB's update operators explanation

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

### 6\. Some gotchas in GET /new-feed

Currently, each time you call GET on this api, it will automatically increase views for the tweets returned in the response ¯\\\_(ツ)\_/¯.

However, Twitter handled this differently, they only increase a tweet's views when the user actually scrolls the tweet into view. So, if future Khoi wanna change this, just remove the view increasing function and apply a new route to increase views, then Front-end will call this route when the user scrolls a specific tweet into view

### 7\. Can be improved

- Show your own tweets in new feed timeline (Solution: only need to push your own id into the array of ids that you're following)

## 8\. Aggreations stage

- $match alternative:
  - $eq: Matches values that are equal to a specified value.
  - $gt: Matches values that are greater than a specified value.
  - $gte: Matches values that are greater than or equal to a specified value.
  - $lt: Matches values that are less than a specified value.
  - $expr: Allows use of aggregation expressions within the query language. And both $expr and $match can be used to filter documents (will be used for more complex situations), using these:
    - $and: Joins query clauses with a logical AND returns all documents that match the conditions of both clauses.
    - $or: Joins query clauses with a logical OR returns all documents that match the conditions of either clause.
    - $not: Inverts the effect of a query expression and returns documents that do not match the query expression.
    - $in: Matches any of the values specified in an array.
    - $nin: Matches none of the values specified in an array.
    - $all: Matches arrays that contain all elements specified in the query.
    - $elemMatch: Selects documents if element in the array field matches all the specified $elemMatch conditions.
    - $size: Selects documents if the array field is a specified size.
    - $type: Selects documents if a field is of the specified type.
    - $regex: Selects documents where values match a specified regular expression.
    - $text: Performs text search.
    - $where: Matches documents that satisfy a JavaScript expression.
- $project: Reshapes each document in the stream, such as by adding new fields or removing existing fields. For each input document, outputs one document.
- $addFields: Adds new fields to documents. Similar to $project, $addFields reshapes each document in the stream; specifically, by adding new fields to output documents that contain the results of an expression.
- $group: Groups input documents by a specified identifier expression and applies the accumulator expression(s), if specified, to each group. Consumes all input documents and outputs one document per each distinct group. The output documents only contain the identifier field and, if specified, accumulated fields.
- $lookup: Performs a left outer join to an unsharded collection in the same database to filter in documents from the “joined” collection for processing. To each input document, the $lookup stage adds a new array field whose elements are the matching documents from the “joined” collection. The $lookup stage passes these reshaped documents to the next stage.
- $unwind: Deconstructs an array field from the input documents to output a document for each element. Each output document replaces the array with an element value. For each input document, outputs n documents where n is the number of array elements and can be zero for an empty array.
- $sort: Reorders the document stream by a specified sort key. Only the order changes; the documents remain unmodified.
- $limit: Passes the first n documents unmodified to the pipeline where n is the specified limit. For each input document, outputs either one document (for the first n documents) or zero documents (after the first n documents).
- $skip: Skips the first n documents where n is the specified skip number and passes the remaining documents unmodified to the pipeline. For each input document, outputs either zero documents (for the first n documents) or one document (if after the first n documents).
