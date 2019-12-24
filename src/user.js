import React from 'react'
import request from 'superagent'
import {Redirect} from 'react-router-dom'
import './style.css'

export class User extends React.Component {

  constructor (props) {
    super(props)
    this.state = {
      newUser: "",
      users: []
    }
  }

  componentWillMount () {
    // サーバーからユーザー一覧を読み込む
    request
      .get('/api/getUsers')
      .end((err, data) => {
        if (err) {
          console.error(err)
          return
        }
        this.setState({users: data.body.users})
      })
  }

  // サーバーに新規ユーザーを作成依頼
  save () {
    if (this.state.newUser === '') {
      return
    }

    request
      .post('/api/addUser')
      .type('form')
      .send({
        name: this.state.newUser,
        info: ''
      })
      .end((err, data) => {
        if (err) {
          console.log(err)
          return
        }
      })
  }

  // ユーザーの削除
  delete (id) {
    request
      .post('/api/deleteUser')
      .type('form')
      .send({
        id: id
      })
      .end((err, data) => {
        if (err) {
          console.log(err)
          return
        }
      })
  }

  /*
    レンダリング
  */
  render () {
    //　ユーザーリストコンポーネント生成
    const usersList = this.state.users.map(user => {
      return (
        <li class="list-group-item">
          <div class="dropright">
            <button class="btn btn-lignt dropdown-toggle" type="button" data-toggle="dropdown">
              {user.name}
            </button>
            <div class="dropdown-menu p-0 border-0">
              <button class="btn btn-danger" onClick={e => this.delete(user.id)}>削除</button>
            </div>
          </div>
        </li>
      )
    })

    return (
      <div class="container-fluid">
        <div class="jumbotron">
          <h1 class="display-4   text-right mb-3">ユーザー編集</h1>
        </div>
        <div class="row ml-3">
          <div class="col-sm-12">
            <form>
              <div class="form-group">
                <label for="newUser">新規ユーザー</label>
                <input type="text" id="newUser" name="newUser" class="form-control w-25"
                    value={this.state.newUser} onChange={e => this.newUserChange(e)} required/><br />
                <button class="btn btn-dark" onClick={e => this.save()}>作成</button>
              </div>
            </form>
          </div>
        </div>

        <hr class="border-dark"/>

        <div class="row ml-3">
          <div class="col-sm-12">
            <form>
              <div class="form-group">
                <p class="lead"><u>登録ユーザー</u></p>
                <ul class="list-group w-50">{usersList}</ul>
              </div>
            </form>
          </div>
        </div>

        <footer>
          <p class="text-white bg-dark mt-3 text-center">谷津掲示板</p>
        </footer>
      </div>
    )
  }

  newUserChange (e) {
    this.setState( { newUser: e.target.value })
  }

}
