/** @jsx React.DOM */
var React = require('react');
var _ = require('underscore');
var cx = require('react-addons').classSet;

var Pips = require('../pips.jsx');

var Positional = React.createClass({
	getDefaultProps : function(){
		return {};
	},
	getInitialState : function(){
		return {
			x : 0,
			y : 0,
			theta : 0
		};
	},
	componentDidMount: function() {
		this.setupMyoEvents(this.props.myo);
	},
	componentWillReceiveProps : function(nextProps){
		if(nextProps.myo.id != this.props.myo.id){
			this.props.myo.off('position');
			this.setupMyoEvents(nextProps.myo);
		}
	},

	setupMyoEvents : function(myo){
		var self = this;
		myo.on('position', function(x,y,theta){
			self.setState({
				x:x,
				y:y,
				theta :theta
			});
		})
	},

	render : function(){
		var self = this;
		return(
			<div className='positional'>
				<div className='title'> <Pips p='.  .' /> POSITIONAL</div>
				<div className='coordinates'>
					<div className='x_axis' style={{width : (this.state.x + 0.5)*100 + '%'}}></div>
					<div className='y_axis' style={{height : (this.state.y + 0.5)*100 + '%'}}></div>
				</div>
				<div className='roll'>
					<div className='roll_bar'
						style={{'-webkit-transform' : 'rotate(' + this.state.theta + 'deg)'}}></div>
				</div>
				<table>
					<tr>
						<td>X</td>
						<td>{this.state.x.toFixed(2)}</td>
					</tr>
					<tr>
						<td>Y</td>
						<td>{this.state.y.toFixed(2)}</td>
					</tr>
					<tr>
						<td>Θ</td>
						<td>{this.state.theta.toFixed(0)} <sup>o</sup></td>
					</tr>
				</table>
			</div>
		);
	}
});

module.exports = Positional;


/*

	$('#pan_y').height( (y + 0.5)*100 + '%');
	$('#pan_x').width( (x + 0.5)*100 + '%');

	$('#roll_bar').css({
		'-webkit-transform' : 'rotate(' + theta + 'deg)'
	});

	$('#x').html(x.toFixed(2))
	$('#y').html(y.toFixed(2))
	$('#theta').html(theta.toFixed(2))

 */