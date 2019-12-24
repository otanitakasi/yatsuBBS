import React from 'react'
import request from 'superagent'
import {Redirect} from 'react-router-dom'
import './style.css'

export class Category extends React.Component {

  constructor (props) {
    super(props)
    this.state = {
      newCategory: "",
      category: []
    }
  }

  componentWillMount () {
    // サーバーからカテゴリー一覧を読み込む
    request
      .get('/api/getCategory')
      .end((err, data) => {
        if (err) {
          console.error(err)
          return
        }
        this.setState({category: data.body.category})
      })
  }

  // サーバーに新規カテゴリーを作成依頼
  save () {
    if (this.state.newCategory === '') {
      return
    }

    request
      .post('/api/addCategory')
      .type('form')
      .send({
        name: this.state.newCategory,
      })
      .end((err, data) => {
        if (err) {
          console.log(err)
          return
        }
      })
  }

  // カテゴリーの削除
  delete (id) {
    request
      .post('/api/deleteCategory')
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
    const categoryList = this.state.category.map(category => {
      return (
        <li class="list-group-item">
          <div class="dropright">
            <button class="btn btn-lignt dropdown-toggle" type="button" data-toggle="dropdown">
              {category.name}
            </button>
            <div class="dropdown-menu p-0 border-0">
              <button class="btn btn-danger" onClick={e => this.delete(category.id)}>削除</button>
            </div>
          </div>
        </li>
      )
    })

    return (
      <div class="container-fluid">
        <div class="jumbotron">
          <h1 class="display-4   text-right mb-3">カテゴリー編集</h1>
        </div>
        <div class="row ml-3">
          <div class="col-sm-12">
            <form>
              <div class="form-group">
                <label for="newcategory">新規カテゴリー</label>
                <input type="text" id="newcategory" name="newcategory" class="form-control w-25"
                    value={this.state.newCategory} onChange={e => this.newCategoryChange(e)} required/><br />
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
                <p class="lead"><u>登録カテゴリー</u></p>
                <ul class="list-group w-50">{categoryList}</ul>
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

  //////////////////////////
  // イベント処理
  /////////////////////////

  newCategoryChange (e) {
    this.setState( { newCategory: e.target.value })
  }

}
