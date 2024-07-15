## Aggregations Pipeline trong MongoDB

Giống như trong SQL, ở trong MongoDB chúng ta cũng có cách để có thể JOIN dữ liệu của các bảng lại với nhau HOẶC là sử dụng các câu lệnh tương tự như trong SQL như WHERE, GROUP BY, HAVE, ...v.v để query và trả ra API đúng như ý muốn cho phía Front-end xử lí

1. Aggregations Pipeline là gì?

   Các bạn hiểu nôm na Aggregations Pipeline là một dây chuyền sản xuất, nơi dữ liệu đi qua nhiều giai đoạn khác nhau (gọi là "stages"), và ở mỗi giai đoạn, dữ liệu sẽ được lọc, biến đổi, và tính toán để tạo ra kết quả cuối cùng.

   Chúng ta sẽ có một ví dụ nho nhỏ, đầu tiên khi chưa chạy vào pipeline, data của API get profile sẽ có dạng như sau:

   ```json
   {
     "name": "Tran Dang Khoi",
     "username": "khoitran",
     "password": "pipeline123",
     "email": "khoi@gmail.com",
     "bio": "Why don't eggs tell jokes? They'd crack each other up",
     "forgot_password_token": "...",
     "email_verify_token": "..."
   }
   ```

   Như các bạn thấy, nếu như chúng ta chỉ cần get mỗi profile người dùng thì sẽ có rất nhiều các trường vô dụng và không cần thiết như là: `password`, `forgot_password_token` và `email_verify_token`, với lại khi get profile chúng ta cũng có thể thêm tính năng đồng thời trả ra cả các bài viết mà người dùng đã likes giống như Twitter vậy! (đương nhiên là trước khi sự kiện Elon Musk like post NSFW diễn ra).

   Ok vậy thì sau một hồi xào nấu và đi qua rất nhiều giai đoạn trong Aggregation Pipeline thì API của chúng ta sẽ có thể biến thành như sau:

   ```json
   {
     "name": "Tran Dang Khoi",
     "username": "khoitran",
     "email": "khoi@gmail.com",
     "bio": "Why don't eggs tell jokes? They'd crack each other up",
     "tweets": "Array(1)",
     "liked_tweets": "Array(5)"
   }
   ```

   Đó chỉ là những chức năng nhỏ mình nhắc tới thui, có gì mọi người có thể tìm hiểu thêm ha

### Aggregations cho GET /:tweet_id

Trong project hiện tại khi user GET một tweet theo `tweet_id` thì chúng ta sẽ cần thêm vào một số thông tin như: `quote_tweets`, `likes`, `comments`, `retweets`, ...v.v mây mây. Vì vậy aggregation pipeline sẽ như sau:

```ts
[
  // Stage 1: Tìm tweet theo tweet_id
  {
    $match: {
      _id: new ObjectId(value),
    },
  },
  // Stage 2: Lấy ra thông tin của toàn bộ hashtags nằm bên trong content của tweet
  {
    $lookup: {
      from: "hashtags",
      localField: "hashtags",
      foreignField: "_id",
      as: "hashtags",
    },
  },
  // Stage 3: Lấy ra thông tin của toàn bộ người dùng đã mention trong tweet
  {
    $lookup: {
      from: "users",
      localField: "mentions",
      foreignField: "_id",
      as: "mentions",
    },
  },
  // Stage 4: Lọc thông tin người dùng, để chỉ lấy ra những thông tin cần thiết và không nhạy cảm
  {
    $addFields: {
      mentions: {
        $map: {
          input: "$mentions",
          as: "mention",
          in: {
            _id: "$$mention._id",
            name: "$$mention.name",
            username: "$$mention.username",
            avatar: "$$mention.avatar",
            cover_photo: "$$mention.cover_photo",
          },
        },
      },
    },
  },
  // Stage 5: Lấy ra thông tin về bookmarks (có thể loại bỏ bớt)
  {
    $lookup: {
      from: "bookmarks",
      localField: "_id",
      foreignField: "tweet_id",
      as: "bookmarks",
    },
  },
  // Stage 6: Lấy ra thông tin về likes (chỉ cho mục đích đếm số lượt likes, còn nếu muốn
  // hiển thị thông tin chi tiết về người dùng đã like thì dùng API khác và API đó cũng cần phân trang)
  {
    $lookup: {
      from: "likes",
      localField: "_id",
      foreignField: "tweet_id",
      as: "likes",
    },
  },
  {
    $lookup: {
      from: "tweets",
      localField: "_id",
      foreignField: "parent_id",
      as: "tweets_children",
    },
  },
  {
    $addFields: {
      bookmarks_count: {
        $size: "$bookmarks",
      },
      likes_count: {
        $size: "$likes",
      },
      retweets_count: {
        $size: {
          $filter: {
            input: "$tweets_children",
            as: "item",
            cond: {
              $eq: ["$$item.type", TweetTypeEnum.RETWEET],
            },
          },
        },
      },
      comments_count: {
        $size: {
          $filter: {
            input: "$tweets_children",
            as: "item",
            cond: {
              $eq: ["$$item.type", TweetTypeEnum.COMMENT],
            },
          },
        },
      },
      quote_tweets_count: {
        $size: {
          $filter: {
            input: "$tweets_children",
            as: "item",
            cond: {
              $eq: ["$$item.type", TweetTypeEnum.QUOTETWEET],
            },
          },
        },
      },
      views_count: {
        $add: ["$guest_views", "$user_views"],
      },
    },
  },
  {
    $project: {
      tweets_children: 0,
    },
  },
];
```
