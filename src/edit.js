import React from 'react'
import request from 'superagent'
import {Redirect} from 'react-router-dom'
import {Link} from "react-router-dom"

import './style.css'

export class Edit extends React.Component {

  constructor (props) {
    super(props)

    // QueryからID情報の解読
    const qId_str = JSON.stringify(location.search).replace(/^.{5}/, '').replace(/.$/, '')
    const id = parseInt(qId_str, 10)

    this.state = {
      posted: 'busy',
      userItems: [],        // 担当者リスト
      categoryItems: [],    // カテゴリー一覧
      id: id,               // 編集する投稿のID
      user: "",             // 担当者
      title: "",            // タイトル
      category: "",         // カテゴリー
      content: "",          // 本文
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

    // データベースから指定idの投稿を読み込む
    request
      .post('/api/getItems')
      .type('form')
      .send({
        id: this.state.id,
        user : '',
        category : '',
        startPeriod: '',
        endPeriod: '',
        keyword: '',
        offset: 0,
      })
      .end((err, data) => {
        if (err) {
          console.error(err)
          return
        }

        const pre_content = '|++  ' + data.body.items[0].date.substr(0, 10) + ' 更新\n'

        this.setState({
          user: data.body.items[0].user,
          category: data.body.items[0].category,
          title: data.body.items[0].title,
          content: pre_content + data.body.items[0].content.replace(/^/, '|  ').replace(/\n/g, '\n|  '),
        })
      })
  }

  // 記事更新
  update () {
    // 入力バリデーション
    if (this.state.user === '') {
      return
    } else if (this.state.title === '') {
      return
    } else if (this.state.category === '') {
      return
    }

    request
      .post('/api/updateItem')
      .type('form')
      .send({
        id:         this.state.id,
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
  }

  // 記事削除
  delete () {
    request
      .post('/api/deleteItem')
      .type('form')
      .send({
        id: this.state.id,
      })
      .end((err, data) => {
        if (data.body.status === 'SUCCESS') {
        }
      })

    this.setState({posted:'end'})
  }

  // レンダリング
  render () {
    // 更新終了でルートにリダイレクト
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
          <h1 class="display-4 text-right mb-3">編集</h1>
        </div>

        <div class="row mx-lg-5 py-5">
          <div class="col-sm-2"> </div>

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
              <textarea id="content" name="content" class="form-control" rows="10" style={{whiteSpace: 'pre-line'}}
                onChange={e => this.doContentChange(e)} value={this.state.content} /><br />

              <div class="d-flex justify-content-between">
                {/* 更新ポップアップ */}
                <button type="button" class="btn btn-info" data-toggle="modal" data-target="#updateModal">更新</button>
                <div class="modal fade" id="updateModal" tabindex="-1" role="dialog" aria-labelledby="updateModalLabel" aria-hidden="true">
                  <div class="modal-dialog" role="document">
                    <div class="modal-content">
                      <div class="modal-header">
                        <h5 class="modal-title" id="updateModalLabel">更新確認</h5>
                        <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                          <span aria-hidden="true">&times;</span>
                        </button>
                      </div>
                      <div class="modal-body">この記事を更新してよろしいですか？</div>
                      <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-dismiss="modal">閉じる</button>
                        <button type="button" class="btn btn-info"  data-dismiss="modal" onClick={e => this.update()}>更新する</button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 削除ポップアップ */}
                <button type="button" class="btn btn-danger align-right"  data-toggle="modal" data-target="#deleteModal">削除</button>
                <div class="modal fade" id="deleteModal" tabindex="-1" role="dialog" aria-labelledby="deleteModalLabel" aria-hidden="true">
                  <div class="modal-dialog" role="document">
                    <div class="modal-content">
                      <div class="modal-header">
                        <h5 class="modal-title" id="deleteModalLabel">削除確認</h5>
                        <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                          <span aria-hidden="true">&times;</span>
                        </button>
                      </div>
                      <div class="modal-body">この記事を削除してよろしいですか？</div>
                      <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-dismiss="modal">閉じる</button>
                        <button type="button" class="btn btn-danger"  data-dismiss="modal" onClick={e => this.delete()}>削除する</button>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>
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
