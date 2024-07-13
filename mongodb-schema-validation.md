## Tweet Schema Validation

```ts
{
  $jsonSchema: {
    bsonType: 'object',
    title: 'tweets object validation',
    required: [
      '_id',
      'user_id',
      'type',
      'audience',
      'content',
      'parent_id',
      'hashtags',
      'mentions',
      'medias',
      'guest_views',
      'user_views',
      'created_at',
      'updated_at'
    ],
    properties: {
      _id: {
        bsonType: 'objectId',
        description: '\'_id\' must be a ObjectId and is required'
      },
      user_id: {
        bsonType: 'objectId',
        description: '\'user_id\' must be a ObjectId and is required'
      },
      type: {
        bsonType: 'int',
        'enum': [
          0,
          1,
          2,
          3
        ],
        description: '\'type\' must be a TweetType and is required'
      },
      audience: {
        bsonType: 'int',
        'enum': [
          0,
          1
        ],
        description: '\'audience\' must be a TweetAudience and is required'
      },
      content: {
        bsonType: 'string',
        description: '\'content\' must be a string and is required'
      },
      parent_id: {
        bsonType: [
          'null',
          'objectId'
        ],
        description: '\'parent_id\' must be a null or ObjectId and is required'
      },
      hashtags: {
        bsonType: 'array',
        uniqueItems: true,
        additionalProperties: false,
        items: {
          bsonType: 'objectId'
        },
        description: '\'hashtags\' must be a array and is required'
      },
      mentions: {
        bsonType: 'array',
        uniqueItems: true,
        additionalProperties: false,
        items: {
          bsonType: 'objectId'
        },
        description: '\'mentions\' must be a array and is required'
      },
      medias: {
        bsonType: 'array',
        uniqueItems: true,
        additionalProperties: false,
        items: {
          bsonType: 'object',
          required: [
            'url',
            'type'
          ],
          additionalProperties: false,
          properties: {
            type: {
              'enum': [
                'image',
                'video',
                'hls'
              ],
              description: '\'type\' is required and can only be one of the given enum values'
            },
            url: {
              bsonType: 'string',
              description: '\'url\' is a required field of type string'
            }
          }
        },
        description: '\'medias\' must be a array and is required'
      },
      guest_views: {
        bsonType: 'int',
        minimum: 0,
        description: '\'guest_views\' must be a ObjectId and is required'
      },
      user_views: {
        bsonType: 'int',
        minimum: 0,
        description: '\'user_views\' must be a number and is required'
      },
      created_at: {
        bsonType: 'date',
        description: '\'created_at\' must be a date and is required'
      },
      updated_at: {
        bsonType: 'date',
        description: '\'updated_at\' must be a date and is required'
      }
    },
    additionalProperties: false
  }
}
```
