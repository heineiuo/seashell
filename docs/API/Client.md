
# Client API


## App

*App extends from Router*

```javascript
const app = new App()
```


## Router

```javascript
const router = new Router()
```


## router.use([path,] middleware)

### router.use(path, (req, res, next)=>{})

```javascript
router.use('/', (req, res, next) => {
    console.log(req.body)
    next() // will run next middleware
})

router.use('/', (req, res, next) => {)
    res.body = {hello: 'world'} // res.body will sending to request client
    res.end() // tell app to stop middleware and send response data
}
```

### router.use([path, ]router)

```javascript
const router = new Router()
router.use('abc', (req, res, next)=>{
    res.body = {success: 1}
    res.end()
})

const router2 = new Router()

router2.use('test', router)


// now , clients can request 'SERVICENAME/test/abc' and
got response '{"success": 1}'

```

### app.use([path, ] router)

just like `router.use`

### app.connect(options)

```javascript
app.connect({
    // options here
})
```

### app.request(url, requestBody)


```javascript

// write in async/await
const response = app.request('/account/profile', {userId: 1})
console.log(response.body) // {profile: {name: 'hansel', gender: 'man'}}

// write in Promise
app.request('/account/profile', {userId: 1})
    .then((response)=>{
        console.log(response.body)
    })

// account means app's appName, defined in key. sea demo/data/service
// /profile means app's router, defined in app

```