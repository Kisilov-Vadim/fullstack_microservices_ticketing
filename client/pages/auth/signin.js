import React, {useState} from 'react';
import Router from 'next/router';

import {useRequest} from "../../hooks";

const Signin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const {doRequest, errors} = useRequest({
    method: 'post',
    url: '/api/users/signin',
    body: {email, password},
    onSuccess: () => Router.push('/'),
  });

  const onSubmit = async (event) => {
    event.preventDefault();
    doRequest();
  }

  return (
    <form onSubmit={onSubmit}>
      <h1>Sign In</h1>
      <div className="form-group">
        <label>Email Address</label>
        <input
          value={email}
          className="form-control"
          onChange={e => setEmail(e.target.value)}
        />
      </div>
      <div className="form-group">
        <label>Password</label>
        <input
          value={password}
          type="password"
          className="form-control"
          onChange={e => setPassword(e.target.value)}
        />
      </div>
      {errors}
      <button className="btn btn-primary">Sign In</button>
    </form>
  )
}

export default Signin;