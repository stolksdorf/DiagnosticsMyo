/** @jsx React.DOM */
var React = require('react');
var _ = require('underscore');
var cx = require('react-addons').classSet;

var Pips = require('../pips.jsx');

var Controls = React.createClass({

	vibrate : function(strength){
		var t = ['short', 'medium', 'long'];
		this.props.myo.vibrate(t[strength]);
	},

	zeroOrientation : function(){
		this.props.myo.zeroOrientation();
	},

	lock : function(){
		this.props.myo.lock();
	},

	unlock : function(){
		this.props.myo.unlock();
	},


	render : function(){
		var self = this;

		return(
			<div className='controls'>

				<div className='title'>
					<Pips p=".  . " />
					Controls
				</div>

				<div className='content'>
					<Pips p="..  " />


					<section className='vibrate'>
						<header>Vibrate</header>

						<button onClick={this.vibrate.bind(null, 0)}>
							SHORT
						</button>
						<button onClick={this.vibrate.bind(null, 1)}>
							MEDIUM
						</button>
						<button onClick={this.vibrate.bind(null, 2)}>
							LONG
						</button>
					</section>
					<section className='vibrate'>
						<header>Lock</header>
						<button onClick={this.lock}>
							LOCK
						</button>
						<button onClick={this.unlock}>
							UNLOCK
						</button>
					</section>


					<div className='other'>
						<Pips p="..  " />
						<button onClick={this.zeroOrientation}>
							ZERO ORIENTATION
						</button>
						<button onClick={this.vibrate.bind(null, 1)}>
							BLE STRENGTH
						</button>
					</div>




				</div>



			</div>
		);
	}
});



var btn = React.createClass({
	render : function(){
		var self = this;
		return(
			<div className='coolButton'>
				<div className={this.props.className}>{this.props.children}</div>
			</div>
		);
	}
});


module.exports = Controls;