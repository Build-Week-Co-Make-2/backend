# Co-Make :house_with_garden: Build Week Project

### June 2020

## Back-End Developers:

| WEB Unit 4  |
| ----------- |
| Victor Tran |

## Schemas

### User

| Field | Type   | Description       |
| ----- | ------ | ----------------- |
| id    | string | auto-generated id |
| name  | string | required          |
| email | string | unique, required  |
| zip   | string | required, 5 chars |
| state | string | required          |

### Issue

| Field       | Type     | Description       |
| ----------- | -------- | ----------------- |
| id          | string   | auto-generated id |
| desc        | string   | required          |
| title       | string   | required          |
| voted       | string[] | auto-created      |
| votes       | number   | auto-created      |
| owner       | object   | User Schema       |
| owner.id    | string   | auto-populated    |
| owner.name  | string   | auto-populated    |
| owner.email | string   | auto-populated    |
| owner.zip   | string   | auto-populated    |
| owner.state | string   | auto-populated    |
| state       | string   | required          |
| zip         | string   | required          |

## **base url**

https://co-make-9cf46.web.app

## Auth

### Register: POST https://co-make-9cf46.web.app/auth/register

#### request.body data

```json
{
    "email": "newTesting@test.com",
    "password": "somepassword123",
    "zip": "33333",
    "name": "test",
    "state": "fl"
}
```

#### response.data

```json
{
    "id": "auto-generated-id",
    "name": "test",
    "email": "newTesting@test.com",
    "zip": "33333",
    "state": "fl"
}
```

### Login: POST https://co-make-9cf46.web.app/auth/login

#### request.body data

```json
{
    "email": "newTesting@test.com",
    "password": "somepassword123"
}
```

#### response.data -- not a json object, just a string

```json
"token"
```

## Issues route

**Note:** Requires token in req.headers.authorization

### Add Issue: POST https://co-make-9cf46.web.app/api/issues/

#### request.body data

```json
{
    "title": "Some test title",
    "desc": "Some test description",
    "state": "fl",
    "zip": "33333"
}
```

#### response.data

```json
{
    "id": "auto-gen-id",
    "desc": "Some test description",
    "title": "Some test title",
    "voted": [],
    "votes": 0,
    "owner": {
        "id": "auto-gen-id",
        "name": "test",
        "email": "newTesting@test.com",
        "zip": "33333",
        "state": "fl"
    },
    "state": "fl",
    "zip": "33333"
}
```

### Get Issue: GET https://co-make-9cf46.web.app/api/issues/

#### response.data

```json
[
    {
        "id": "auto-gen-id",
        "desc": "Some test description",
        "title": "Some test title",
        "voted": [],
        "votes": 0,
        "owner": {
            "id": "auto-gen-id",
            "name": "test",
            "email": "newTesting@test.com",
            "zip": "33333",
            "state": "fl"
        },
        "state": "fl",
        "zip": "33333"
    }
]
```

### Get Issue by ID: GET https://co-make-9cf46.web.app/api/issues/:id

#### response.data

```json
{
    "id": "auto-gen-id",
    "desc": "Some test description",
    "title": "Some test title",
    "voted": [],
    "votes": 0,
    "owner": {
        "id": "auto-gen-id",
        "name": "test",
        "email": "newTesting@test.com",
        "zip": "33333",
        "state": "fl"
    },
    "state": "fl",
    "zip": "33333"
}
```

### Update issue by ID: PUT https://co-make-9cf46.web.app/api/issues/:id

#### request.body

```json
{
    "title": "I've been updated",
    "desc": "I've also been to something else",
    "state": "CO",
    "zip": "44444"
}
```

#### response.data

```json
{
    "id": "auto-gen-id",
    "desc": "I've also been to something else",
    "title": "I've been updated",
    "voted": [],
    "votes": 0,
    "owner": {
        "id": "bMEuq9UlpYzJm6z7g404",
        "name": "test",
        "email": "newEndpoint@test.com",
        "zip": "33333",
        "state": "fl"
    },
    "state": "CO",
    "zip": "44444"
}
```

### Delete issue by ID: DELETE https://co-make-9cf46.web.app/api/issues/:id

#### response.data

```json
{
    "message": "Post has been deleted at <Date.toLocaleString()>"
}
```

## Users Route

### Get Users: GET https://co-make-9cf46.web.app/api/users/

#### response.data

```json
[
    {
        "id": "auto-gen-id",
        "name": "test",
        "email": "newTesting@test.com",
        "zip": "33333",
        "state": "fl"
    }
]
```

### Get Issue by ID: GET https://co-make-9cf46.web.app/api/users/:id

#### response.data

```json
{
    "id": "auto-gen-id",
    "name": "test",
    "email": "newTesting@test.com",
    "zip": "33333",
    "state": "fl"
}
```

<!--
### Update issue by ID: PUT https://co-make-9cf46.web.app/api/issues/:id

#### request.body

```json
{
    "title": "I've been updated",
    "desc": "I've also been to something else",
    "state": "CO",
    "zip": "44444"
}
```

#### response.data

```json
{
    "id": "auto-gen-id",
    "desc": "I've also been to something else",
    "title": "I've been updated",
    "voted": [],
    "votes": 0,
    "owner": {
        "id": "bMEuq9UlpYzJm6z7g404",
        "name": "test",
        "email": "newEndpoint@test.com",
        "zip": "33333",
        "state": "fl"
    },
    "state": "CO",
    "zip": "44444"
}
``` -->

### Delete issue by ID: DELETE https://co-make-9cf46.web.app/api/users/:id

#### response.data

```json
{
    "message": "User has been deleted at <Date.toLocaleString()>"
}
```
