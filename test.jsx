function formatNumber(n) {
    if (typeof n === 'number') {
        if (isNaN(n))
            return 'NaN';
        return (Math.round(n * 100) / 100).toString();
    }
    return n ? n.toString() : '';
}
class NumberBox extends React.Component {
    constructor(props) {
        super(props);
        this.isCancel = false;
        this.isDraging = false;
        this.min = Number.NEGATIVE_INFINITY;
        this.max = Number.POSITIVE_INFINITY;
        this.state = { focus: false, draging: false, input: null };
        if (typeof props.min === 'number')
            this.min = props.min;
        if (typeof props.max === 'number')
            this.max = props.max;
    }
    componentDidMount() {
    }
    componentWillUnmount() {
        if (this.dispose) {
            this.dispose();
            this.dispose = null;
        }
    }
    onChange(e) {
        // var value = parseFloat(e.target.value);
        // if (e.target.value === '') value = 0;
        // if (isNaN(value))
        // {
        // 	return;
        // }
        if (this.state.focus && !this.state.draging) {
            this.setState({ input: e.target.value });
        }
    }
    onMouseDown(e) {
        if (this.dispose) {
            this.dispose();
            this.dispose = null;
        }
        if (this.props.disabled)
            return;
        var startX = e.screenX;
        var lastY = e.screenY;
        var firstDelta = true;
        var self = this;
        function onMouseUp(e) {
            self.dispose && self.dispose();
            self.dispose = null;
        }
        function onMouseMove(e) {
            var delta = lastY - e.screenY;
            //console.log('move delta', delta);
            //e.preventDefault();
            //e.stopPropagation();
            var xdelta = Math.abs(e.screenX - startX);
            if (firstDelta) {
                if (Math.abs(delta) > 20 && xdelta < Math.abs(delta)) {
                    firstDelta = false;
                    lastY = e.screenY;
                    self.props.onChangeStart && self.props.onChangeStart();
                }
                return;
            }
            lastY = e.screenY;
            delta = -e.movementY;
            if (delta !== 0) {
                delta *= self.props.step || 0.1;
                if (self.props.onChangeDelta) {
                    self.props.onChangeDelta(delta);
                }
                else {
                    var value = parseFloat(self.state.input) || parseFloat(self.props.value) || 0;
                    value += delta;
                    if (value > self.max)
                        value = self.max;
                    if (value < self.min)
                        value = self.min;
                    self.setState({ input: value.toString() });
                    self.props.onChangeValue && self.props.onChangeValue(value);
                }
            }
        }
        //console.log('down start')
        const capture = false;
        window.addEventListener('mouseup', onMouseUp, capture);
        window.addEventListener('mousemove', onMouseMove, capture);
        this.isDraging = true;
        this.setState({ draging: true });
        this.dispose = function () {
            window.removeEventListener('mouseup', onMouseUp, capture);
            window.removeEventListener('mousemove', onMouseMove, capture);
            this.isDraging = false;
            document.exitPointerLock();
            this.setState({ draging: false });
        };
    }
    onBlur(e) {
        this.setState({ focus: false, input: null });
        if (this.isCancel) {
            this.isCancel = false;
            return;
        }
        if (this.state.input) {
            var value = parseFloat(this.state.input);
            if (!isNaN(value)) {
                if (value > this.max)
                    value = this.max;
                if (value < this.min)
                    value = this.min;
                this.props.onChangeValue && this.props.onChangeValue(value);
            }
        }
    }
    onFocus(e) {
        this.setState({ focus: true });
    }
    render() {
        var self = this;
        function onKeyDown(e) {
            if (e.key === 'Enter' || e.key === 'Escape') {
                self.isCancel = e.key === 'Escape';
                e.currentTarget.blur();
            }
        }
        var props = Object.assign({}, this.props);
        delete props.onChangeDelta;
        delete props.onChangeValue;
        delete props.onChangeStart;
        var showValue = formatNumber(this.props.value);
        if (this.state.focus && !this.state.draging && this.state.input) {
            showValue = this.state.input;
        }
        return React.createElement("input", Object.assign({ onDragStart: e => e.preventDefault(), draggable: false, type: 'text', onKeyDown: onKeyDown, onBlur: e => this.onBlur(e), onChange: e => this.onChange(e), onFocus: e => this.onFocus(e), onMouseDown: e => this.onMouseDown(e) }, props, { value: showValue }));
    }
}



ReactDOM.render(<NumberBox value={123} />, document.getElementById('root'));