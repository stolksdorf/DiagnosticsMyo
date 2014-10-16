/** @jsx React.DOM */
var React = require('react');
var _ = require('underscore');
var cx = require('react-addons').classSet;

var Pips = require('../pips.jsx');

var Graphs = React.createClass({
	getDefaultProps : function(){
		return {};
	},
	getInitialState : function(){
		return {};
	},
	componentDidMount: function(){
		this.setMyoEvents(this.props.myo);
		this.createGraph();
	},

	componentWillReceiveProps : function(nextProps){
		if(nextProps.myo.id != this.props.myo.id){
			this.props.myo.off('imu');
			this.setMyoEvents(nextProps.myo);
		}
	},

	clearHistory : function(){
		this.history = {
			gyroscope : _.times(100, function(){return {x:0,y:0,z:0}}),
			accelerometer : _.times(100, function(){return {x:0,y:0,z:0}}),
			orientation : _.times(100, function(){return {x:0,y:0,z:0,w:0}})
		}
	},


	setMyoEvents : function(myo){
		var self = this;
		this.clearHistory();
		myo.on('imu', function(data){
			_.each(data, function(datum, type){
				self.history[type].push(data[type])
				self.history[type] = self.history[type].slice(1);
			})
			self.updateGraph();
		})
	},

	updateGraph : function(){
		var self = this;
		_.each(this.plots, function(plot, type){
			data = self.convertData(self.history[type])
			plot.setData(data);
			plot.draw();
		});
	},

	convertData : function(measurement){
		var result = {};
		_.each(measurement, function(data, index){
			_.each(data, function(val, axis){
				result[axis] = result[axis] || {label : axis, data : []};
				result[axis].data.push([val, index])
			});
		});
		return _.values(result);
	},

	createGraph : function(){
		var self = this;
		var xaxis = {
			gyroscope : {min : -400,max : 400},
			accelerometer : {min : -2.5,max : 2.5},
			orientation : {min : -1,max : 1},
		}

		this.plots = _.reduce(this.history, function(r, history, type){
			r[type] = $.plot("#"+type, self.convertData(history), {
				series: {shadowSize: 0},
				colors: [ '#84FFF1', '#FFF38A', '#FF4B23', '#00797F'],
				xaxis: xaxis[type],
				yaxis : {
					show: false,
					min : 0,
					max : 100
				},
				legend : {backgroundOpacity : 0},
				grid : {borderColor : "#427F78"}
			});
			return r;
		},{})
	},

	render : function(){
		var self = this;
		return(
			<div className='graphs'>
				<div className='title'><Pips p='.  .' />IMU GRAPHS</div>


				<div className='graph'>
					<div className='graphTitle'>Gyroscope</div>
					<div id='gyroscope' className='plot'></div>
				</div>
				<div className='graph'>
					<div className='graphTitle'>Accelerometer</div>
					<div id='accelerometer' className='plot'></div>
				</div>
				<div className='graph'>
					<div className='graphTitle'>Orientation</div>
					<div id='orientation' className='plot'></div>
				</div>
			</div>
		);
	}
});

module.exports = Graphs;