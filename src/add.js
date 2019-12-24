import React from 'react'
import request from 'superagent'
import {Redirect} from 'react-router-dom'
import './style.css'

export class Add extends React.Component {

  constructor (props) {
    super(props)

    this.state = {
      posted: 'busy',
      userItems: [],        // 担当者リスト
      user: "",             // 選択された担当者
      title: "",            // タイトル
      categoryItems: [],    // カテゴリー一覧
      category: "",         // カテゴリー
      content: ""           // 本文
    }
  }

  componentWillMount () {
    // ユーザー一覧を取得
    request
      .get('/api/getUsers')
      .end((err, data) => {
        if (err) {
          console.error(err)
          return
        }
        this.setState({userItems: data.body.users})
      })

    // カテゴリー一覧を取得
    request
      .get('/api/getCategory')
      .end((err, data) => {
        if (err) {
          console.error(err)
          return
        }
        this.setState({categoryItems: data.body.category})
      })

  }

  // サーバーに新規投稿を送信
  save () {
    const dat = new Date()
    const date_stamp = dat.getTime()

    // 入力バリデーション
    if (this.state.user === '') {
      return
    } else if (this.state.title === '') {
      return
    } else if (this.state.category === '') {
      return
    }

    request
      .post('/api/addItem')
      .type('form')
      .send({
        user :      this.state.user,
        title :     this.state.title,
        category :  this.state.category,
        content :   this.state.content
      })
      .end((err, data) => {
        if (data.body.status === 'SUCCESS') {
        }
      })

    this.setState({posted:'end'})
    //window.alert('投稿しました')
  }

  render () {
    // 投稿終了でルートにリダイレクト
    if (this.state.posted === 'end') {
      return <Redirect to={'/'} />
    }

    // 担当者セレクトボックスの選択肢を生成
    const userOptions = this.state.userItems.map(user => {
      return (
        <option key={user.name} value={user.name}> {user.name} </option>
      )
    })

    // カテゴリセレクトボックスの選択肢を生成
    const categoryOptions = this.state.categoryItems.map(category => {
      return (
        <option key={category.name} value={category.name}> {category.name} </option>
      )
    })

    return (
      <div class="container-fluid">
        <div class="jumbotron">
          <h1 class="display-4 text-right mb-3">新規投稿</h1>
        </div>

        <div class="row mx-lg-5 py-5">
          <div class="col-sm-2"></div>

          <div class="col-sm-8">
            <div class="form-group">
              <label for="user">投稿者</label> <br />
              <select class="form-control" neme="user" id="user"
                value={this.state.user} onChange={e => this.doUserChange(e)} required>
                <option value="">選択してください</option>
                {userOptions}
              </select> <br />

              <label for="category">カテゴリー</label>
              <select class="form-control" neme="category" id="category"
                value={this.state.category} onChange={e => this.doCategoryChange(e)} required>
                <option value="">選択してください</option>
                {categoryOptions}
              </select> <br />

              <label for="title">タイトル</label>
              <input type="text" id="title" name="title" class="form-control"
                value={this.state.title} onChange={e => this.doTitleChange(e)} required/><br />

              <label for="content">本文</label>
              <textarea id="content" name="content" class="form-control" rows="10"
                onChange={e => this.doContentChange(e)} value={this.state.content} /><br />

              <button type="button" class="btn btn-dark" data-toggle="modal" data-target="#addModal">投稿</button>
              <div class="modal fade" id="addModal" tabindex="-1" role="dialog" aria-labelledby="addModalLabel" aria-hidden="true">
                <div class="modal-dialog" role="document">
                  <div class="modal-content">
                    <div class="modal-header">
                      <h5 class="modal-title" id="addModalLabel">投稿確認</h5>
                      <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                      </button>
                    </div>
                    <div class="modal-body">この記事を投稿してよろしいですか？</div>
                    <div class="modal-footer">
                      <button type="button" class="btn btn-secondary" data-dismiss="modal">閉じる</button>
                      <button type="button" class="btn btn-info"  data-dismiss="modal" onClick={e => this.save()}>投稿する</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="col-sm-2"></div>
        </div>

        <hr />

        <footer>
          <p class="text-white bg-dark mt-1 text-center">谷津掲示板</p>
        </footer>
      </div>
    )
  }

  //////////////////////////////////////
  // イベント処理関数
  //////////////////////////////////////

  doUserChange (e) {
    this.setState( { user: e.target.value })
  }

  doTitleChange (e) {
    this.setState( { title: e.target.value })
  }

  doCategoryChange (e) {
    this.setState( { category: e.target.value })
  }

  doContentChange (e) {
    this.setState( { content: e.target.value })
  }
}
