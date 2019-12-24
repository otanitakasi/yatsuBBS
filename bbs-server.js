/*
############################
サーバーサイドプログラム
############################
*/

const express = require('express');
const mysql = require('mysql')
const bodyParser = require('body-parser')

// MySQLの設定情報
const mysql_setting = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'yatsu-bbs'
}

// パラメータ定義
// １ページに表示するレコード数 -> クライアント側(src/define.js)と合わせる必要あり
const itemsForPage = 5

// Expressを起動
const app = express();

// フォーム処理のため、body-parserを有効にする
app.use(bodyParser.urlencoded({extended: true}))

// 待ち受け開始
app.listen(3000, ()=> {
  console.log('起動しました - http://localhost:3000')
})

// 静的ファイルの読み込み
app.use('/user', express.static('./public'))
app.use('/category', express.static('./public'))
app.use('/add', express.static('./public'))
app.use('/edit', express.static('./public'))
app.use('/search', express.static('./public'))
app.use('/about', express.static('./public'))
app.use('/', express.static('./public'))
// トップへのアクセスは/publicへ流す
app.get('/', (req, res) => {
  res.redirect(302, '/public')
})


////////////////////////////////////////////
// apiの定義
////////////////////////////////////////////

// ユーザー一覧の取得API
app.get('/api/getUsers', (req, res) => {

  const connection = mysql.createConnection(mysql_setting)
  connection.connect()
  connection.query('SELECT * from users', (err, results, fields) => {
    if (err == null) {
      res.json({users: results})
    }
  })
  connection.end()
})

// 新規ユーザー追加API
app.post('/api/addUser', (req, res) => {
  const newuser = req.body

  const connection = mysql.createConnection(mysql_setting)
  connection.connect()
  connection.query('insert into users set ?', newuser, (err, results, fields) => {
    if (err) {
      console.log('insert user error' + results)
    }
  })
  connection.end()
})

// ユーザー削除API
app.post('/api/deleteUser', (req, res) => {
  const user = req.body

  const connection = mysql.createConnection(mysql_setting)
  connection.connect()
  connection.query('delete from users where id=?', user.id, (err, results, fields) => {
    if (err) {
      console.log('delete user error' + results)
    }
  })
  connection.end()
})

// 検索ヒット数の取得API
// 検索前に数を確認する
app.post('/api/countItems', (req, res) => {

  // ユーザーの指定なければ全て検索
  const user = (req.body.user === '') ? '%' : req.body.user
  // カテゴリーの指定なければ全て検索
  const category = (req.body.category === '') ? '%' : req.body.category
  // 開始期間の指定なければ1970年以降に設定
  const startPeriod = (req.body.startPeriod === '') ? '1970-01-01 00:00:00' : req.body.startPeriod
  // 終了期間の指定なければ2100年までに設定
  const endPeriod = (req.body.endPeriod === '') ? '2100-01-01 00:00:00' : req.body.endPeriod.replace(/.{7}$/, '23:59:59')
  // キーワード
  const keyword = '%' + req.body.keyword + '%'

  const connection = mysql.createConnection(mysql_setting)
  connection.connect()
  connection.query('SELECT COUNT(*) AS count from items where user LIKE ? AND category LIKE ? AND date >= ? AND date <= ? AND (title LIKE ? OR content LIKE ? ) ORDER BY date DESC',
    [user, category, startPeriod, endPeriod, keyword, keyword], (err, results, fields) => {
    if (err == null) {
      res.json({itemCount: results})
    }
  })

  connection.end()
})

// 記事検索API
app.post('/api/getItems', (req, res) => {

  // ユーザーの指定なければ全て検索
  const user = (req.body.user === '') ? '%' : req.body.user
  // カテゴリーの指定なければ全て検索
  const category = (req.body.category === '') ? '%' : req.body.category
  // 開始期間の指定なければ1970年以降に設定
  const startPeriod = (req.body.startPeriod === '') ? '1970-01-01 00:00:00' : req.body.startPeriod
  // 終了期間の指定なければ2100年までに設定
  const endPeriod = (req.body.endPeriod === '') ? '2100-01-01 00:00:00' : req.body.endPeriod.replace(/.{7}$/, '23:59:59')
  // キーワード
  const keyword = '%' + req.body.keyword + '%'
  // ID
  const id = (req.body.id === '') ? '%' : req.body.id
  // offset
  const offset = (req.body.offset === '') ? 0 : parseInt(req.body.offset, 10)


  console.log(req.body)

  const connection = mysql.createConnection(mysql_setting)
  connection.connect()
  connection.query('SELECT * from items where user LIKE ? AND category LIKE ? AND date >= ? AND date <= ? AND (title LIKE ? OR content LIKE ? ) AND id LIKE ? ORDER BY date DESC LIMIT ?, ?',
    [user, category, startPeriod, endPeriod, keyword, keyword, id, offset, itemsForPage], (err, results, fields) => {
    if (err == null) {
      res.json({items: results})
    }
  })

  connection.end()
})

// 新規記事投稿API
app.post('/api/addItem', (req, res) => {
  const newItem = req.body

  const connection = mysql.createConnection(mysql_setting)
  connection.connect()
  connection.query('insert into items set ?', newItem, (err, results, fields) => {
    if (err) {
      console.log('insert item error' + results)
    }
  })

  res.json({status: 'SUCCESS'})

  connection.end()
})

// 記事編集API
// 指定IDの記事を更新する
app.post('/api/updateItem', (req, res) => {
  const id = req.body.id
  const user = req.body.user
  const title = req.body.title
  const category = req.body.category
  const content = req.body.content
  const updateItem = {'user':user, 'title':title, 'category':category, 'content': content}

  const connection = mysql.createConnection(mysql_setting)
  connection.connect()
  connection.query('update items set ? where id = ?', [updateItem, id], (err, results, fields) => {
    if (err) {
      console.log('update item error' + results)
    }
  })

  res.json({status: 'SUCCESS'})

  connection.end()
})

// 記事削除のAPI
// 指定IDの記事を削除する
app.post('/api/deleteItem', (req, res) => {
  const id = req.body

  const connection = mysql.createConnection(mysql_setting)
  connection.connect()
  connection.query('delete from items where id=?', id.id, (err, results, fields) => {
    if (err) {
      console.log('delete item error' + results)
    }
  })
  connection.end()
})

// カテゴリー一覧取得API
app.get('/api/getCategory', (req, res) => {

  const connection = mysql.createConnection(mysql_setting)
  connection.connect()
  connection.query('SELECT * from category', (err, results, fields) => {
    if (err == null) {
      res.json({category: results})
    }
  })
  connection.end()
})

// 新規カテゴリー追加API
app.post('/api/addCategory', (req, res) => {
  const newCategory = req.body

  const connection = mysql.createConnection(mysql_setting)
  connection.connect()
  connection.query('insert into category set ?', newCategory, (err, results, fields) => {
    if (err) {
      console.log('insert category error' + results)
    }
  })
  connection.end()
})

// カテゴリー削除API
app.post('/api/deleteCategory', (req, res) => {
  const category = req.body

  const connection = mysql.createConnection(mysql_setting)
  connection.connect()
  connection.query('delete from category where id=?', category.id, (err, results, fields) => {
    if (err) {
      console.log('delete category error' + results)
    }
  })
  connection.end()
})
