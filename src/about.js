import React from 'react'
import request from 'superagent'
import {Redirect} from 'react-router-dom'
import './style.css'

export class About extends React.Component {

  constructor (props) {
    super(props)
    this.state = {
    }
  }

  /*
    レンダリング
  */
  render () {
    return (
      <div class="container-fluid">
        <div class="jumbotron">
          <h1 class="display-4   text-right mb-3">この掲示板について</h1>
        </div>
        <div class="row ml-3">
          <div class="col-sm-12">
          </div>
        </div>

        <hr class="border-dark"/>

        <footer>
          <p class="text-white bg-dark mt-3 text-center">谷津掲示板</p>
        </footer>
      </div>
    )
  }
}
