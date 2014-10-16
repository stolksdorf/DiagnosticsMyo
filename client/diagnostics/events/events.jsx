/** @jsx React.DOM */
var React = require('react');
var _ = require('underscore');
var cx = require('react-addons').classSet;

var Events = React.createClass({
	events : ['pose', 'double_tap', 'arm_busy', 'arm_rest', 'lock', 'unlock'],
	getDefaultProps : function(){
		return {};
	},
	getInitialState : function(){
		return {
			eventHistory : []
		};
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
			myo.on(event, function(a,b,c){
				self.addEvent(event, a,b,c);
			});
		})
	},

	addEvent : function(a,b,c){
		this.state.eventHistory.push(a + '\n');
		if(this.state.eventHistory.length > 30) this.state.eventHistory = this.state.eventHistory.slice(this.state.eventHistory.length - 30);
		this.setState({
			eventHistory : this.state.eventHistory
		});
	},

	render : function(){
		var self = this;
		return(
			<div className='events'>
				{this.state.eventHistory}
			</div>
		);
	}
});

module.exports = Events;