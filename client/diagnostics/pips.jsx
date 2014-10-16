/** @jsx React.DOM */
var React = require('react');
var _ = require('underscore');
var cx = require('react-addons').classSet;

var Pips = React.createClass({
	getDefaultProps : function(){
		return {
			p : '....'
		};
	},
	getInitialState : function(){
		return {};
	},
	componentDidMount: function() {},

	render : function(){
		var self = this;

		var pips = [];

		if(this.props.p[0] === '.') pips.push(<div className='ul'></div>);
		if(this.props.p[1] === '.') pips.push(<div className='ur'></div>);
		if(this.props.p[2] === '.') pips.push(<div className='dr'></div>);
		if(this.props.p[3] === '.') pips.push(<div className='dl'></div>);


		return(
			<div className='pips'>
				{pips}
			</div>
		);
	}
});


module.exports = Pips;


