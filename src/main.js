import React from 'react'
import ReactDom from 'react-dom'
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link
} from "react-router-dom";

// Bootstrap有効化
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap"

// ローカルモジュール読み込み
import {Home} from "./home"
import {Add} from "./add"
import {Edit} from "./edit"
import {User} from "./user"
import {Category} from "./category"
import {Search} from "./search"
import {About} from "./about"

// メインコンポーネント
export default class App extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      keyword: '',
    }
  }

  changeKeyword (keyword) {
    this.setState({keyword: keyword})
  }

  render () {
    return (
      <Router>
        <div>
          {/* 固定ヘッダー */ }
          <Header changeKeyword={e => this.changeKeyword(e)}/>
          {/* A <Switch> looks through its children <Route>s and
              renders the first one that matches the current URL. */}
          <Switch>
            <Route path="/add">
              <Add />
            </Route>
            <Route path="/edit">
              <Edit />
            </Route>
            <Route path="/user">
              <User />
            </Route>
            <Route path="/category">
              <Category />
            </Route>
            <Route path="/search">
              <Search keyword={this.state.keyword}/>
            </Route>
            <Route path="/about">
              <About />
            </Route>
            <Route path="/">
              <Home />
            </Route>
          </Switch>
        </div>
      </Router>
    )
  }
}


// 固定ヘッダーの定義
//function Header () {
class Header extends React.Component {

  constructor (props) {
    super(props)

    this.state = {
      keyword: '',
    }
  }

  render () {
    return (
      <div>
        <nav class="navbar navbar-expand-lg navbar-dark bg-dark sticky-top">
          <Link class="navbar-brand" to="/">谷津BBS</Link>
          <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
            <span class="navbar-toggler-icon"></span>
          </button>

          <div class="collapse navbar-collapse" id="navbarSupportedContent">
            <ul class="navbar-nav mr-auto">
              <li class="nav-item active">
                <Link class="nav-link" to="/">ホーム <span class="sr-only">(current)</span></Link>
              </li>
              <li class="nav-item active">
                <Link to="/add" class="nav-link">新規作成 </Link>
              </li>
              <li class="nav-item dropdown active">
                <Link class="nav-link dropdown-toggle" to="/user" id="navbarDropdown" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                  設定
                </Link>
                <div class="dropdown-menu" aria-labelledby="navbarDropdown">
                  <Link class="dropdown-item" to="/user">ユーザー編集</Link>
                  <Link class="dropdown-item" to="/category">カテゴリー編集</Link>
                  <div class="dropdown-divider"></div>
                  <Link class="dropdown-item" to="/about">About</Link>
                </div>
              </li>
              <li class="nav-item">
                <Link class="nav-link disabled" to="/login" tabindex="-1" aria-disabled="true">ログイン</Link>
              </li>
            </ul>
            <div class="form-inline my-2 my-lg-0">
              <input class="form-control mr-sm-2" type="search" placeholder="Search" aria-label="Search"
                value={this.state.keyword} onChange={e => this.doKeywordChange(e)} />
              <Link class="btn btn-outline-success my-2 my-sm-0 btn-light" onClick={e => this.doKeywordSubmit()}
                to={"/search?keyword=" + this.state.keyword}>Search</Link>
            </div>
          </div>
        </nav>
      </div>
    )
  }

  doKeywordChange (e) {
    this.setState( { keyword: e.target.value })
  }


  doKeywordSubmit (e) {
    this.props.changeKeyword(this.state.keyword)
  }

}



ReactDom.render(
  <App />,
  document.getElementById('root')
)
