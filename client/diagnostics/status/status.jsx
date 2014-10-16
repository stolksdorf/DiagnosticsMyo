/** @jsx React.DOM */
var React = require('react');
var _ = require('underscore');
var cx = require('react-addons').classSet;

var Pips = require('../pips.jsx');

var Status = React.createClass({
	events : ['lock', 'unlock', 'connected', 'disconnected', 'arm_lost', 'arm_recognized', 'arm_busy', 'arm_rest'],
	getDefaultProps : function(){
		return {};
	},
	getInitialState : function(){
		return {};
	},
	componentDidMount: function() {
		this.setupMyoEvents(this.props.myo);
	},
	componentWillReceiveProps : function(nextProps){
		var self = this;
		if(nextProps.myo.id != this.props.myo.id){
			_.each(this.events, function(event){
				self.props.myo.off(event);
			})
			this.setupMyoEvents(nextProps.myo);
		}
	},

	setupMyoEvents : function(myo){
		var self = this;
		_.each(this.events, function(event){
			myo.on(event, function(){
				self.props.update();
			});
		})
	},


	render : function(){
		var self = this;
		var myo = this.props.myo;
		console.log(myo.armIsBusy);
		return(
			<div className='status'>
				<div className='title'><Pips p=".  ." /> STATUS</div>

				<div className={'locked' + (myo.isLocked ? ' selected' : '')}>
					<Pips p=".  ." />
					<i className='fa fa-lock'></i> LOCKED
				</div>
				<div className={'unlocked' + (!myo.isLocked ? ' selected' : '')}>
					<Pips p="...." />
					<i className='fa fa-unlock'></i> UNLOCKED
				</div>

				<div className='connect'>
					MYO CONNECT {myo.connect_version}

				</div>

				<div className={'armBusy'  + (myo.armIsBusy === false ? ' selected' : '')}>

					<div className='busy_light'><div></div></div> Arm Busy


				</div>


				<div className='arm'>


				</div>


				connect version
				arm
				myo direction
				orientationOffset




			</div>
		);
	}
});

module.exports = Status;