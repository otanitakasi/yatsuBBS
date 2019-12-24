import React from 'react'
import request from 'superagent'
import {Redirect} from 'react-router-dom'
import {Link} from "react-router-dom";
import Calendar from 'react-calendar'
import './style.css'

import {itemsForPage, pageWindowUnit} from './define.js'    // パラメータ読み込み

export class Search extends React.Component {

  constructor (props) {
    super(props)
    this.state = {
      items: [],                          // 投稿一覧リスト
      itemCount: 0,                       // 投稿数
      currentPage: 1,                     // 表示中のページ番号
      pageWindow: 1,                      // 表示中ページネーションウィンドウ
      count: 0,
    }
  }

  // コンポーネントがマウントされたら読み込む
  componentWillMount () {
    this.setState({currentPage: 1, pageWindow: 1})
    // 検索数を確認
    request
      .post('/api/countItems')
      .type('form')
      .send({
        user : '',
        category : '',
        startPeriod: '',
        endPeriod: '',
        keyword: this.props.keyword,
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
        user : '',
        category : '',
        startPeriod: '',
        endPeriod: '',
        keyword: this.props.keyword,
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

  componentDidUpdate(prevProps) {
    // プロパティが変更されたときのみ実行
    if (this.props.keyword !== prevProps.keyword) {
      this.setState({currentPage: 1, pageWindow: 1})
      // 検索数を確認
      request
        .post('/api/countItems')
        .type('form')
        .send({
          user : '',
          category : '',
          startPeriod: '',
          endPeriod: '',
          keyword: this.props.keyword,
        })
        .end((err, data) => {
          if (err) {
            console.error(err)
            return
          }
          this.setState({itemCount: data.body.itemCount[0].count})
        })

      //投稿一覧を読み込む
      request
        .post('/api/getItems')
        .type('form')
        .send({
          user : '',
          category : '',
          startPeriod: '',
          endPeriod: '',
          keyword: this.props.keyword,
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

  }

  // 表示ページ切り替え
  changePage (pageNum) {
    // 表示中のページ番号更新
    this.setState({currentPage: pageNum})
    const offset = (pageNum-1) * itemsForPage

    // データベースから投稿一覧を読み込む
    request
      .post('/api/getItems')
      .type('form')
      .send({
        user : '',
        category : '',
        startPeriod: '',
        endPeriod: '',
        keyword: this.props.keyword,
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

  // 描画
  render () {
    // データベースからのデータからコンポートを生成
    const itemsList = this.state.items.map(item => {
      // 日付を生成
      const date = new Date(item.date)
      const date_str = date.toLocaleDateString()

      // id名指定
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
          <h1 class="display-4 text-right mb-3">検索結果</h1>
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

  /////////////////////////////////////////
  // イベント処理
  /////////////////////////////////////////

  pageWindowShift (prev) {
    const window = this.state.pageWindow
    if (prev === true) {
      this.setState({pageWindow: window - 1})
    } else {
      this.setState({pageWindow: window + 1})
    }
  }

}
