import React from 'react'
import request from 'superagent'
import {Redirect} from 'react-router-dom'
import {Link} from "react-router-dom";
import Calendar from 'react-calendar'
import './style.css'

import {itemsForPage, pageWindowUnit} from './define.js'    // パラメータ読み込み

export class Home extends React.Component {

  constructor (props) {
    super(props)

    this.state = {
      userItems: [],                      // ユーザーリスト
      categoryItems: [],                  // カテゴリー
      itemCount: 0,                       // 投稿数
      items: [],                          // 投稿一覧リスト
      user: "",                           // 検索ユーザー
      category: "",                       // 検索カテゴリー
      startPeriod: '',                    // 検索期間：開始
      startPeriodCalenderDisp: false,     // 検索期間：開始　カレンダー表示コントロール
      endPeriod: '',                      // 検索期間：終了
      endPeriodCalenderDisp: false,       // 検索期間：終了　カレンダー表示コントロール
      keyword: '',                        // 検索ワード
      _user: "",                          // ページ切替時に使用するための保存：検索ユーザー
      _category: "",                      // ページ切替時に使用するための保存：検索カテゴリー
      _startPeriod: '',                   // ページ切替時に使用するための保存：検索期間：開始
      _endPeriod: '',                     // ページ切替時に使用するための保存：検索期間：終了
      _keyword: '',                       // ページ切替時に使用するための保存：検索ワード
      currentPage: 1,                     // 表示中のページ番号
      pageWindow: 1,                      // 表示中ページネーションウィンドウ
    }
  }

  componentWillMount () {
    // データベースからユーザー一覧を読み込む
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

    // データベースから投稿数を読み込む
    request
      .post('/api/countItems')
      .type('form')
      .send({
        user : this.state.user,
        category : this.state.category,
        startPeriod: this.state.startPeriod,
        endPeriod: this.state.endPeriod,
        keyword: this.state.keyword,
      })
      .end((err, data) => {
        if (err) {
          console.error(err)
          return
        }
        this.setState({itemCount: data.body.itemCount[0].count})
      })

    // データベースから投稿一覧を読み込む
    request
      .post('/api/getItems')
      .type('form')
      .send({
        user : this.state.user,
        category : this.state.category,
        startPeriod: this.state.startPeriod,
        endPeriod: this.state.endPeriod,
        keyword: this.state.keyword,
        id: '',
        offset: 0,
      })
      .end((err, data) => {
        if (err) {
          console.error(err)
          return
        }
        this.setState({items: data.body.items})
      })
  }

  // データベースから指定された記事を検索
  search () {
    // 表示中のページ番号更新
    this.setState({currentPage: 1, pageWindow: 1})

    // Date型の値をデータベースの形式にする
    const startPeriod = (this.state.startPeriod === '') ? ''
        : this.state.startPeriod.toLocaleString()
    const endPeriod = (this.state.endPeriod === '') ? ''
        : this.state.endPeriod.toLocaleString()

    // データベースから投稿数を読み込む
    request
      .post('/api/countItems')
      .type('form')
      .send({
        user : this.state.user,
        category : this.state.category,
        startPeriod: startPeriod,
        endPeriod: endPeriod,
        keyword: this.state.keyword,
      })
      .end((err, data) => {
        if (err) {
          console.error(err)
          return
        }
        this.setState({itemCount: data.body.itemCount[0].count})
      })

    // データベースから投稿一覧を読み込む
    request
      .post('/api/getItems')
      .type('form')
      .send({
        user : this.state.user,
        category : this.state.category,
        startPeriod: startPeriod,
        endPeriod: endPeriod,
        keyword: this.state.keyword,
        id: '',
        offset: 0,
      })
      .end((err, data) => {
        if (err) {
          console.error(err)
          return
        }
        this.setState({items: data.body.items})
      })

    // ページ切り替え用に、検索条件の保存
    this.setState( {
        _user : this.state.user,
        _category : this.state.category,
        _startPeriod: this.state.startPeriod,
        _endPeriod: this.state.endPeriod,
        _keyword: this.state.keyword,
    })
  }

  // 表示ページ切り替え
  changePage (pageNum) {
    // 表示中のページ番号更新
    this.setState({currentPage: pageNum})
    const offset = (pageNum-1) * itemsForPage

    // Date型の値をデータベースの形式にする
    const _startPeriod = (this.state._startPeriod === '') ? ''
        : this.state._startPeriod.toLocaleString()
    const _endPeriod = (this.state._endPeriod === '') ? ''
        : this.state._endPeriod.toLocaleString()

    // データベースから投稿一覧を読み込む
    request
      .post('/api/getItems')
      .type('form')
      .send({
        user : this.state._user,
        category : this.state._category,
        startPeriod: _startPeriod,
        endPeriod: _endPeriod,
        keyword: this.state._keyword,
        id: '',
        offset: offset,
      })
      .end((err, data) => {
        if (err) {
          console.error(err)
          return
        }
        this.setState({items: data.body.items})
      })
  }

  //
  render () {
    // ユーザーセレクトボックス
    const userOptions = this.state.userItems.map(user => {
      return (
        <option key={user.name} value={user.name}> {user.name} </option>
      )
    })

    // カテゴリセレクトボックス
    const categoryOptions = this.state.categoryItems.map(category => {
      return (
        <option key={category.name} value={category.name}> {category.name} </option>
      )
    })

    // カレンダー
    const startCallendarComponent = this.state.startPeriodCalenderDisp ? (<Calendar onClickDay={e => this.dostartPeriodChange(e)}/>) : null
    const endCallendarComponent = this.state.endPeriodCalenderDisp ? (<Calendar onClickDay={e => this.doendPeriodChange(e)}/>) : null

    // データベース読み込み投稿リスト
    const itemsList = this.state.items.map(item => {
      const date = new Date(item.date)
      const date_str = date.toLocaleDateString()
      const id_name = "#id" + item.id
      const id = 'id' + item.id

      return (
        <div class="row m-0">
          <div class="col-sm-11">
            <div class="card">
              <div class="card-header m-0 p-0" id="headingOne">
                <div class="row m-0">
                  <div class="col-md-2 border-right border-secondary">
                    <h5 class="card-title pt-2 text-center">{date_str}</h5>
                  </div>
                  <div class="col-md-1 border-right border-secondary">
                    <p class="card-text pt-2 text-center">{item.category}</p>
                  </div>
                  <div class="col-md-1 border-right border-secondary">
                    <p class="card-text pt-2 text-center">{item.user}</p>
                  </div>
                  <div class="col-md-7 border-right border-secondary">
                    <h5 class="mb-1 pt-2">
                      <button class="btn btn-light font-weight-bold" type="button" data-toggle="collapse"
                        data-target={id_name} aria-expanded="true" aria-controls="collapseOne">
                        {item.title}
                      </button>
                    </h5>
                  </div>
                  <div class="col-md-1">
                    <p class="card-text pt-2 text-center">{item.id}</p>
                  </div>
                </div>
              </div>

              <div id={id} class="collapse pt-2 pl-3" aria-labelledby="headingOne"
                data-parent="#accordionExample">
                <div class="card-body" style={{whiteSpace: 'pre-line'}}> {/* 改行コードで改行するためのスタイル設定 */}
                  {item.content}
                </div>
              </div>
            </div>
          </div>

          <div class="col-md-1 p-0">
            <Link to={"/edit?id=" + item.id} class="btn btn-success px-4 py-2">編集</Link>
          </div>
        </div>
      )
    })

    // Pagenation
    const maxPage = (this.state.itemCount%itemsForPage === 0)
      ? (this.state.itemCount/itemsForPage) :  parseInt(this.state.itemCount / itemsForPage + 1)
    const maxWindow = (maxPage%pageWindowUnit === 0)
      ? (maxPage/pageWindowUnit) : parseInt(maxPage / pageWindowUnit + 1)
    const pageList = []

    if (this.state.pageWindow === 1) {
        pageList.push(<li class="page-item disabled"><button class="page-link">Previous</button></li>)
    } else {
        pageList.push(<li class="page-item"><button class="page-link" onClick={e => this.pageWindowShift(true)}>Previous</button></li>)
    }
    for (var i=1; i<=pageWindowUnit; i++) {
      const pageNum = i + (this.state.pageWindow-1) * pageWindowUnit

      if (pageNum === this.state.currentPage) {
        pageList.push(<li class="page-item active"><button class="page-link" onClick={e => this.changePage(pageNum)}>{pageNum}</button></li>)
      } else if (pageNum > maxPage) {
        pageList.push(<li class="page-item disabled"><button class="page-link" onClick={e => this.changePage(pageNum)}>{pageNum}</button></li>)
      } else {
        pageList.push(<li class="page-item"><button class="page-link" onClick={e => this.changePage(pageNum)}>{pageNum}</button></li>)
      }
    }
    if (this.state.pageWindow >= maxWindow) {
        pageList.push(<li class="page-item disabled"><button class="page-link">Next</button></li>)
    } else {
        pageList.push(<li class="page-item"><button class="page-link" onClick={e => this.pageWindowShift(false)}>Next</button></li>)
    }

    // render()関数リターン
    return (
      <div class="container-fluid">
        <div class="jumbotron">
          <h1 class="display-4 text-right mb-3">記事一覧</h1>
        </div>

        <div class="row mx-lg-5">
          <div class="form-group">
            <div class="row">
              <div class="col-sm-6">
                <label for="user">投稿者</label> <br />
                <select class="form-control" neme="user" id="user"
                  value={this.state.user} onChange={e => this.doUserChange(e)}>
                  <option value="">選択してください</option>
                  {userOptions}
                </select> <br />
              </div>
              <div class="col-sm-6">
                <label for="category">カテゴリー</label>
                <select class="form-control" neme="category" id="category"
                  value={this.state.category} onChange={e => this.doCategoryChange(e)}>
                  <option value="">選択してください</option>
                  {categoryOptions}
                </select> <br />
              </div>
            </div>

            <label>期間</label><br />
            <div>
              <button class="btn btn-lignt border border-dark shadow-sm" type="button"
                onClick={e => this.setState({startPeriodCalenderDisp: true})} >
                {(this.state.startPeriod === '') ? '20xx/yy/zz' : this.state.startPeriod.toLocaleDateString()}
              </button>

              {startCallendarComponent}

              <span class="p-2">  〜  </span>

              <button class="btn btn-lignt border border-dark" type="button"
                onClick={e => this.setState({endPeriodCalenderDisp: true})} >
                {(this.state.endPeriod === '') ? '20xx/yy/zz' : this.state.endPeriod.toLocaleDateString()}
              </button>

              {endCallendarComponent}
            </div> <br />

            <label for="keyword">キーワード</label>
            <input type="text" id="keyword" name="keyword" class="form-control"
              value={this.state.keyword} onChange={e => this.doKeywordChange(e)} /><br />

            <button class="btn btn-dark" onClick={e => this.search()}>検索</button>
          </div>
        </div>

        <hr class="border-dark"/>

        <div class="row mx-lg-5">
          <div class="col-sm-12">
            <div class="accordion" id="accordionExample">
              <div class="row m-0">
                <div class="col-sm-11">
                  <div class="card">
                    <div class="card-header m-0 p-0 bg-dark text-light" id="headingOne">
                      <div class="row m-0">
                        <div class="col-md-2 border-right border-white">
                          <h6 class="card-title font-weight-bold text-center pt-3">日付</h6>
                        </div>
                        <div class="col-md-1 border-right border-white">
                          <h6 class="card-title font-weight-bold text-center pt-3">カテゴリ</h6>
                        </div>
                        <div class="col-md-1 border-right border-white">
                          <h6 class="card-title font-weight-bold text-center pt-3">投稿者</h6>
                        </div>
                        <div class="col-md-7 border-right border-white">
                          <h6 class="card-title font-weight-bold text-center pt-3">タイトル</h6>
                        </div>
                        <div class="col-md-1 border-right border-white">
                          <h6 class="card-title font-weight-bold text-center pt-3">ID</h6>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {itemsList}
            </div>
          </div>
        </div>

        <hr class="border-dark"/>

        <nav aria-label="...">
          <ul class="pagination">
            {pageList}
          </ul>
        </nav>

        <footer>
          <p class="text-white bg-dark mt-5 text-center">谷津掲示板</p>
        </footer>
      </div>
    )
  }

  doUserChange (e) {
    this.setState( { user: e.target.value })
  }

  doCategoryChange (e) {
    this.setState( { category: e.target.value })
  }

  dostartPeriodChange (e) {
    this.setState( {
      startPeriod: e,
      startPeriodCalenderDisp: false,
    })
  }

  doendPeriodChange (e) {
    this.setState( {
      endPeriod: e,
      endPeriodCalenderDisp: false,
    })
  }

  doKeywordChange (e) {
    this.setState( { keyword: e.target.value })
  }

  pageWindowShift (prev) {
    const window = this.state.pageWindow
    if (prev === true) {
      this.setState({pageWindow: window - 1})
    } else {
      this.setState({pageWindow: window + 1})
    }
  }

  // doSubmit (e) {
  //   e.preventDefault()
  //   window.alert(JSON.stringify(this.state.category))
  // }
}
