var main = (function (exports) {
    'use strict';

    const UNSELECTED_COLOR = 0xff0000;
    const SELECTED_COLOR = 0x00ff00;
    const UNHOVERED_OPACITY = 0.7;
    const HOVERED_OPACITY = 1;
    class ControlPoint {
        //private _isOnCurve = false;
        constructor(curve, x, y, z) {
            this.index = -1;
            this.disposed = false;
            this._attached = false;
            this._hovered = false;
            this._selected = false;
            this._forward = new THREE.Vector3(1, 0, 0);
            this._rotation = 0;
            const SCALE = 90;
            this.curve = curve;
            this.point = new THREE.Vector3(x, y, z);
            var geom = new THREE.BoxBufferGeometry(0.2 * SCALE, 0.2 * SCALE, 0.2 * SCALE);
            var mat = new THREE.MeshLambertMaterial({
                color: UNSELECTED_COLOR,
                transparent: true,
                opacity: UNHOVERED_OPACITY
            });
            var box = this._box = new THREE.Mesh(geom, mat);
            box.position.copy(this.point);
            const ARROW_SCALE = 0.2 * SCALE;
            box.add(new THREE.ArrowHelper(new THREE.Vector3(1, 0, 0), new THREE.Vector3(-1 * ARROW_SCALE, 0, 0), 2 * ARROW_SCALE, 0xff0000, 0.1, 0.05), new THREE.ArrowHelper(new THREE.Vector3(0, 1, 0), new THREE.Vector3(0, 0 * ARROW_SCALE, 0), 1.5 * ARROW_SCALE, 0x00ff00, 0.3 * ARROW_SCALE, 0.18 * ARROW_SCALE), new THREE.ArrowHelper(new THREE.Vector3(0, 0, 1), new THREE.Vector3(0, 0, -1 * ARROW_SCALE), 2 * ARROW_SCALE, 0x0000ff, 0.1, 0.05));
            {
                var geom2 = new THREE.BoxBufferGeometry(0.1 * SCALE, 0.1 * SCALE, 0.5 * SCALE);
                var mat2 = new THREE.MeshLambertMaterial({ color: 0xff0000 });
                box.add(new THREE.Mesh(geom2, mat2));
            }
            {
                var geom3 = new THREE.BoxBufferGeometry(0.3 * SCALE, 0.02 * SCALE, 0.4 * SCALE);
                var mat3 = new THREE.MeshLambertMaterial({ color: 0x0000ff });
                box.add(new THREE.Mesh(geom3, mat3));
            }
            box['controlPoint'] = this;
            box['dispose'] = function () {
                box.material.dispose();
                box.geometry.dispose();
                geom2.dispose();
                mat2.dispose();
                geom3.dispose();
                mat3.dispose();
            };
            box.addEventListener('hoveron', e => { this.hovered = true; });
            box.addEventListener('hoveroff', e => { this.hovered = false; });
            this.visible = curve.visible;
        }
        reset(x, y, z, rotation) {
            this.point.set(x, y, z);
            this._rotation = rotation;
            this.mesh.position.copy(this.point);
        }
        get mesh() { return this._box; }
        get hovered() { return this._hovered; }
        get selected() { return this._selected; }
        get visible() { return this._box.visible; }
        get selectable() { return this._box['disablePick'] !== true; }
        //get isOnCurve() { return this._isOnCurve; }
        set hovered(val) {
            this._hovered = val;
            this._box['material']['opacity'] = ((this._hovered && !this._selected) ? HOVERED_OPACITY : UNHOVERED_OPACITY);
        }
        set selected(val) {
            this._selected = val;
            this._box['material']['color'].set(this._selected ? SELECTED_COLOR : UNSELECTED_COLOR);
            this._box['material']['opacity'] = ((this._hovered || !this._selected) ? HOVERED_OPACITY : UNHOVERED_OPACITY);
            this.mesh.scale.setScalar(this._selected ? 0.5 : 1);
        }
        set visible(val) {
            this._box.visible = val;
        }
        set selectable(val) { this._box['disablePick'] = !val; }
        // set isOnCurve(val)
        // {
        // 	this._isOnCurve = val;
        // 	for (var inner of this._box.children)
        // 	{
        // 		inner.visible = val;
        // 	}
        // }
        refreshAllowRotation() {
            this.allowRotation = this.curve.curve.allowPointRotation(this.index);
        }
        set allowRotation(val) {
            for (var inner of this._box.children) {
                inner.visible = val;
            }
        }
        get allowRotation() { return this.curve.curve.allowPointRotation(this.index); }
        get allowTranslation() { return this.curve.curve.allowPointTranslation(this.index); }
        attachTo(app) {
            if (this._attached)
                return;
            this._attached = true;
            app.scene.add(this._box);
            app.addControlPoint(this);
        }
        dispose() {
            if (this._box.parent) {
                this._box.parent.remove(this._box);
            }
            this._box['dispose']();
            this.disposed = true;
            app.removeControlPoint(this);
        }
        get forward() { return this._forward; }
        get rotation() { return this._rotation; }
        _updateFromLogicCurve(index, curve) {
            this.index = index;
            curve.getPointPosition(index, this.point);
            curve.getPointForward(index, this._forward);
            this._rotation = curve.getPointRotation(index);
            this.mesh.position.copy(this.point);
            curve.getPointQuaternion(this.index, this.mesh.quaternion);
            this.refreshAllowRotation();
        }
    }
    //# sourceMappingURL=ControlPoint.js.map

    class AbstractCurve {
        //curveType: string;
        constructor() {
            this.isGhostCurve = false;
        }
        generateMulti() {
            return [this.generate()];
        }
        getControlPointCount() { return 0; }
        allowPointRotation(i) { return true; }
        allowPointTranslation(i) { return true; }
        getPointPosition(i, target) { }
        getPointRotation(i) { return 0; }
        getPointForward(i, target) {
            target.set(0, 0, 0);
        }
        getPointQuaternion(i, target) {
            target.set(0, 0, 0, 1);
        }
        setPointPosition(i, pos) {
        }
        setPointRotation(i, rot) {
        }
        update() {
        }
        toJSON() {
            return { type: this.curveType };
        }
        fromJSON(obj) {
        }
        allowOperator(op) { return false; }
        applyOperator(op) { return false; }
        getParameter(key) { }
        setParameter(key, value) { }
        getHelperLine() { return []; }
    }
    //# sourceMappingURL=AbstractCurve.js.map

    function lerpRotation(r0, r1, t) {
        if (t <= 0)
            return r0;
        if (t >= 1)
            return r1;
        //make it simple swap r0 and r1
        if (r0 > r1) {
            var temp = r0;
            r0 = r1;
            r1 = temp;
            t = 1 - t;
        }
        if (r1 - r0 <= 180) {
            return r0 + (r1 - r0) * t;
        }
        var r = r1 + (360 - (r1 - r0)) * t;
        if (r > 180) {
            r = -180 + r - 180;
        }
        return r;
    }
    function findClosestPointIndex(arr, pt) {
        var idx = 0;
        var dist = Number.MAX_VALUE;
        for (var i = 0; i < arr.length; ++i) {
            var dist2 = pt.distanceToSquared(arr[i]);
            if (dist2 < dist) {
                idx = i;
                dist = dist2;
            }
        }
        return idx;
    }
    const Z_AXIS = new THREE.Vector3(0, 0, 1);
    const TEMP_Q = new THREE.Quaternion;
    function calcQuaternion(previousQuaternion, previousTarget, previousRotation, quaternion, forward, rotation) {
        if (!previousQuaternion) {
            quaternion.setFromUnitVectors(Z_AXIS, forward);
            var q1 = TEMP_Q;
            q1.setFromAxisAngle(Z_AXIS, rotation / 180 * Math.PI);
            quaternion.multiply(q1);
        }
        else {
            quaternion.copy(previousQuaternion);
            TEMP_Q.setFromUnitVectors(previousTarget, forward);
            quaternion.premultiply(TEMP_Q);
            TEMP_Q.setFromAxisAngle(Z_AXIS, (rotation - previousRotation) / 180 * Math.PI);
            quaternion.multiply(TEMP_Q);
        }
    }
    function generateQuaternion(result) {
        var count = result.positions.length;
        result.quaternions = new Array(count);
        for (var i = 0; i < count; ++i) {
            result.quaternions[i] = new THREE.Quaternion();
            if (i === 0) {
                calcQuaternion(null, null, 0, result.quaternions[i], result.forwards[i], result.rotations[i]);
            }
            else {
                calcQuaternion(result.quaternions[i - 1], result.forwards[i - 1], result.rotations[i - 1], result.quaternions[i], result.forwards[i], result.rotations[i]);
            }
        }
    }
    function calcPositionError(positions) {
        var max = 0;
        var min = Infinity;
        for (var i = 0; i + 1 < positions.length; ++i) {
            var s = positions[i].distanceToSquared(positions[i + 1]);
            if (s > max)
                max = s;
            if (s < min)
                min = s;
        }
        max = Math.sqrt(max);
        min = Math.sqrt(min);
        var error = (max - min) / min;
        return { min, max, error };
    }
    function applyRoll(q, rot) {
        TEMP_Q.setFromAxisAngle(Z_AXIS, rot * Math.PI / 180);
        q.multiply(TEMP_Q);
    }
    //# sourceMappingURL=util.js.map

    //base class for implement a THREE.Curve<> curve.
    class BaseCurveCurve extends AbstractCurve {
        constructor() {
            super();
            this._generateQuality = 100;
            this._positions = [];
            this._rotations = [];
            this.curveType = '';
        }
        getInternalCurve() { return this._curve; }
        getControlPointCount() {
            return this._positions.length;
        }
        getPointPosition(i, target) {
            target.copy(this._positions[i]);
        }
        getPointRotation(i) {
            return this._rotations[i];
        }
        getPointForward(i, target) {
            if (i >= 0 && i < this._positions.length) {
                if (!this._cacheGenerate) {
                    this.generate();
                }
                if (this.allowPointRotation(i)) {
                    var idx = findClosestPointIndex(this._cacheGenerate.positions, this._positions[i]);
                    target.copy(this._cacheGenerate.forwards[i]);
                }
                else {
                    target.set(0, 0, 0);
                }
                return;
            }
        }
        getPointQuaternion(i, target) {
            if (i >= 0 && i < this._positions.length) {
                if (!this._cacheGenerate)
                    this.generate();
                if (this.allowPointRotation(i)) {
                    var idx = findClosestPointIndex(this._cacheGenerate.positions, this._positions[i]);
                    target.copy(this._cacheGenerate.quaternions[idx]);
                }
                else {
                    target.set(0, 0, 0, 1);
                }
            }
        }
        allowPointRotation(i) { return true; }
        allowPointTranslation(i) { return true; }
        //call update() is needed.
        setPointPosition(i, pos) {
            if (i >= 0 && i < this._positions.length) {
                this._positions[i].copy(pos);
                this._cacheGenerate = null;
            }
        }
        //call update() is needed.
        setPointRotation(i, rot) {
            if (i >= 0 && i < this._rotations.length
                && this.allowPointRotation(i)) {
                if (rot < -180)
                    rot = -180;
                else if (rot > 180)
                    rot = 180;
                this._rotations[i] = rot;
                this._cacheGenerate = null;
            }
        }
        update() {
            this._cacheGenerate = null;
            if (this._curve instanceof THREE.CurvePath) {
                for (var cc of this._curve.curves) {
                    cc.arcLengthDivisions = cc.getLength() | 0;
                    cc.updateArcLengths();
                }
            }
            this._curve.arcLengthDivisions = this._curve.getLength() | 0;
            this._curve.updateArcLengths();
        }
        supportedOperator() { return []; }
        allowOperator(op) { return false; }
        applyOperator(op) { return false; }
        //generate helper
        generatePositions(numpoints, result) {
            result.positions = this._curve.getSpacedPoints(numpoints - 1);
            this._curveErrorInfo = calcPositionError(result.positions);
            return true;
        }
        generateForwards(numpoints, result) {
            var forwards = new Array(numpoints);
            for (var i = 0; i < numpoints; ++i) {
                forwards[i] = this._curve.getTangentAt(i / (numpoints - 1));
            }
            result.forwards = forwards;
            return true;
        }
        generateRotations(numpoints, result) {
            if (!result.positions || result.positions.length !== numpoints) {
                throw new Error('invalid input result');
            }
            var rotations = new Array(numpoints);
            var segments = [];
            for (var i = 0; i < this._rotations.length; ++i) {
                if (this.allowPointRotation(i)) {
                    var idx = findClosestPointIndex(result.positions, this._positions[i]);
                    segments.push({ idx: idx, rot: this._rotations[i] });
                }
            }
            if (segments.length === 0 || segments.length === 1) {
                var rot = segments.length === 0 ? 0 : segments[0].rot;
                for (var i = 0; i < rotations.length; ++i)
                    rotations[i] = rot;
            }
            else {
                if (segments[0].idx > 0) {
                    segments.unshift({ idx: 0, rot: segments[0].rot });
                }
                if (segments[segments.length - 1].idx != rotations.length - 1) {
                    segments.push({ idx: rotations.length - 1, rot: segments[segments.length - 1].rot });
                }
                for (var i = 0; i + 1 < segments.length; ++i) {
                    var seg1 = segments[i];
                    var seg2 = segments[i + 1];
                    //to avoid divide by 0
                    if (seg1.idx === seg2.idx) {
                        rotations[seg1.idx] = seg1.rot;
                    }
                    else {
                        for (var j = seg1.idx; j <= seg2.idx; ++j) {
                            rotations[j] = lerpRotation(seg1.rot, seg2.rot, (j - seg1.idx) / (seg2.idx - seg1.idx));
                        }
                    }
                }
            }
            //finally check it
            for (var o of rotations) {
                if (isNaN(o)) {
                    throw new Error('invalid generate rotations');
                }
                if (typeof o !== 'number') {
                    throw new Error('invalid generate rotations');
                }
            }
            result.rotations = rotations;
            return true;
        }
        generateQuaternions(numpoints, result) {
            generateQuaternion(result);
        }
        generate(numpoints) {
            numpoints = numpoints || 200;
            if (this._generateQuality < 100)
                numpoints = (numpoints * this._generateQuality / 100) | 0;
            if (numpoints < 20)
                numpoints = 20;
            if (this._cacheGenerate && this._cacheGenerate.positions.length === numpoints) {
                return this._cacheGenerate;
            }
            var result = { positions: undefined, rotations: undefined, forwards: undefined, quaternions: undefined };
            this.generatePositions(numpoints, result);
            this.generateForwards(numpoints, result);
            this.generateRotations(numpoints, result);
            this.generateQuaternions(numpoints, result);
            this._cacheGenerate = result;
            return this._cacheGenerate;
        }
        getParameter(key) {
            if (key === 'curveError') {
                return this._curveErrorInfo ? this._curveErrorInfo.error : 0;
            }
            else if (key === 'generateQuality') {
                return this._generateQuality;
            }
        }
        setParameter(key, value) {
            if (key === 'generateQuality' && (value >= 0 && value <= 100) && typeof value === 'number') {
                this._generateQuality = value;
                this._cacheGenerate = null;
                return true;
            }
        }
    }
    //# sourceMappingURL=BaseCurveCurve.js.map

    class CatmullRomCurve3 extends BaseCurveCurve {
        constructor(initJson) {
            super();
            this.curveType = 'CatmullRomCurve3';
            this._positions = [
                new THREE.Vector3(-100, 0, 0),
                new THREE.Vector3(0, 100, 0),
                new THREE.Vector3(100, 0, 0),
            ];
            this._rotations = [
                0, 0, 0
            ];
            this._curve = new THREE.CatmullRomCurve3(this._positions, false, 'catmullrom');
            if (initJson && initJson.points) {
                this.fromJSON(initJson);
            }
            else {
                this.update();
            }
        }
        //#region impl interface
        toJSON() {
            var points = [];
            for (var i = 0; i < this._positions.length; ++i) {
                points.push({
                    x: this._positions[i].x,
                    y: this._positions[i].y,
                    z: this._positions[i].z,
                    rotation: this._rotations[i]
                });
            }
            return {
                type: this.curveType,
                points,
                tension: this._curve['tension']
            };
        }
        fromJSON(obj) {
            if (obj.type === this.curveType) {
                var points = obj.points;
                if (points && points.length >= 2) {
                    this._positions.length = points.length;
                    this._rotations.length = points.length;
                    for (var i = 0; i < points.length; ++i) {
                        this._rotations[i] = points[i].rotation || 0;
                        if (!this._positions[i])
                            this._positions[i] = new THREE.Vector3();
                        this._positions[i].set(points[i].x || 0, points[i].y || 0, points[i].z || 0);
                    }
                    this._curve['tension'] = obj.tension || 0.5;
                    this.update();
                }
            }
        }
        allowPointRotation(i) {
            return true;
        }
        allowPointTranslation(i) {
            return true;
        }
        update() {
            super.update();
        }
        //#endregion
        allowOperator(op) {
            if (op.type === 'removePoints') {
                var points = op.points;
                if (Array.isArray(op.points)
                    && (new Set(points)).size === points.length
                    && this._positions.length - points.length >= 2) {
                    for (var idx of points) {
                        if (!(idx >= 0 && idx < this._positions.length))
                            return false;
                    }
                    return true;
                }
            }
            else if (op.type === 'splitBetween') {
                var points = op.points;
                if (Array.isArray(op.points)
                    && op.points.length === 2) {
                    var i = op.points[0];
                    var j = op.points[1];
                    if (i >= 0 && i < this._positions.length &&
                        j >= 0 && j < this._positions.length) {
                        return i == j + 1 || i == j - 1;
                    }
                }
            }
            return false;
        }
        applyOperator(op) {
            if (op.type === 'removePoints') {
                if (!this.allowOperator(op))
                    return false;
                let points = op.points;
                for (let i = this._positions.length - 1; i >= 0; --i) {
                    if (points.indexOf(i) >= 0) {
                        this._positions.splice(i, 1);
                        this._rotations.splice(i, 1);
                    }
                }
                this._cacheGenerate = null;
                return true;
            }
            else if (op.type === 'splitBetween') {
                if (!this.allowOperator(op))
                    return false;
                let i = op.points[0];
                let j = op.points[1];
                if (i > j) {
                    [i, j] = [j, i];
                }
                var mid = this._positions[i].clone().add(this._positions[j]).multiplyScalar(0.5);
                var midrot = lerpRotation(this._rotations[i], this._rotations[j], 0.5);
                this._positions.splice(j, 0, mid);
                this._rotations.splice(j, 0, midrot);
                this._cacheGenerate = null;
                return true;
            }
            return false;
        }
        setParameter(key, value) {
            if (key === 'tension') {
                if (typeof value === 'number' && !isNaN(value)) {
                    if (value > 1)
                        value = 1;
                    if (value < 0)
                        value = 0;
                    this._curve['tension'] = value;
                    this.update();
                    return true;
                }
            }
            return super.setParameter(key, value);
        }
        getParameter(key) {
            if (key === 'tension') {
                return this._curve['tension'];
            }
            return super.getParameter(key);
        }
    }
    //# sourceMappingURL=CatmullRomCurve3.js.map

    const DEFAULT_OBJECT = {
        type: 'QuadraticBezierCurve3',
        points: [
            { x: -400, y: -120, z: 0 },
            { x: -200, y: 120, z: 0 },
            { x: 0, y: 120, z: 0 },
            { x: 200, y: 120, z: 0 },
            { x: 400, y: -120, z: 0 },
        ]
    };
    class QuadraticBezierCurve3 extends BaseCurveCurve {
        constructor(jsObj) {
            super();
            this.curveType = 'QuadraticBezierCurve3';
            if (!jsObj || !jsObj.points) {
                this.fromJSON(DEFAULT_OBJECT);
            }
            else {
                this.fromJSON(jsObj);
            }
        }
        fromJSON(obj) {
            if (obj.type === this.curveType &&
                obj.points && obj.points.length >= 3) {
                var points = obj.points;
                var positions = this._positions;
                var rotations = this._rotations;
                positions.length = rotations.length = points.length;
                for (var i = 0; i < points.length; ++i) {
                    positions[i] = new THREE.Vector3(points[i].x || 0, points[i].y || 0, points[i].z || 0);
                    rotations[i] = points[i].rotation || 0;
                }
                this._rebuild();
            }
        }
        toJSON() {
            var points = [];
            var count = this._positions.length;
            for (var i = 0; i < count; ++i) {
                points.push({
                    x: this._positions[i].x,
                    y: this._positions[i].y,
                    z: this._positions[i].z,
                    rotation: this._rotations[i]
                });
            }
            return { type: this.curveType, points };
        }
        allowPointRotation(i) {
            if (i >= 0 && i < this._positions.length) {
                return i % 2 === 0;
            }
            return false;
        }
        allowOperator(op) {
            if (op.type === 'smooth') {
                return true;
            }
            else if (op.type === 'splitBetween') {
                var points = op.points;
                if (points && points.length <= 3 && points.length > 0) {
                    var pts = points.slice();
                    pts.sort((a, b) => a - b);
                    var ptpt = pts[0];
                    for (var i = 0; i + 1 < pts.length; ++i) {
                        if (pts[i] + 1 !== pts[i + 1])
                            return false;
                        if (pts[i + 1] % 2 == 1)
                            ptpt = pts[i + 1];
                    }
                    if (ptpt !== -1 && ptpt % 2 === 1)
                        return true;
                }
            }
            else if (op.type === 'removePoints') {
                var points = op.points;
                //简单一点，只能删除一个
                if (points && points.length === 1 && points[0] % 2 === 0 && this._positions.length > 3) {
                    return true;
                }
            }
            return false;
        }
        applyOperator(op) {
            if (!this.allowOperator(op))
                return false;
            if (op.type === 'smooth') {
                var positions = this._positions;
                var count = positions.length;
                for (var i = 1; i + 2 < count; i += 2) {
                    var p0 = positions[i];
                    var p1 = positions[i + 1];
                    var p2 = positions[i + 2];
                    var dist = p1.distanceTo(p2);
                    var len = p1.distanceTo(p2);
                    if (len >= 0.00000001) {
                        p2.copy(p1).sub(p0).multiplyScalar(dist / len).add(p1);
                    }
                }
                this._cacheGenerate = null;
                return true;
            }
            else if (op.type === 'splitBetween') {
                var pt = -1;
                for (var i = 0; i < op.points.length; ++i) {
                    if (op.points[i] % 2 === 1) {
                        pt = op.points[i] % 2;
                        break;
                    }
                }
                if (pt !== -1) {
                    var p0 = this._positions[pt - 1];
                    var p1 = this._positions[pt + 1];
                    var rot = lerpRotation(this._rotations[pt - 1], this._rotations[pt + 1], 0.5);
                    var diff = p1.clone().sub(p0);
                    this._positions.splice(pt, 1, diff.clone().multiplyScalar(0.25).add(p0), diff.clone().multiplyScalar(0.5).add(p0), diff.clone().multiplyScalar(0.75).add(p0));
                    this._rotations.splice(pt, 1, 0, rot, 0);
                    this._cacheGenerate = null;
                    this._rebuild();
                    return true;
                }
            }
            else if (op.type === 'removePoints') {
                let pt = op.points[0];
                if (pt % 2 === 0) {
                    if (pt === 0) {
                        this._positions.splice(0, 3);
                        this._rotations.splice(0, 3);
                    }
                    else if (pt === this._positions.length - 1) {
                        this._positions.splice(pt - 2, 3);
                        this._rotations.splice(pt - 2, 3);
                    }
                    else {
                        var mid = this._positions[pt - 1].clone().add(this._positions[pt + 1]).multiplyScalar(0.5);
                        this._positions.splice(pt - 1, 3, mid);
                        this._rotations.splice(pt - 1, 3, 0);
                    }
                    this._rebuild();
                    return true;
                }
            }
            return false;
        }
        getHelperLine() {
            var arr = [];
            for (var i = 1; i < this._positions.length; i += 2) {
                arr.push(this._positions[i], this._positions[i + 1]);
                arr.push(this._positions[i], this._positions[i - 1]);
            }
            return arr;
        }
        _rebuild() {
            var curve = new THREE.CurvePath();
            for (var i = 0; i + 2 < this._positions.length; i += 2) {
                var bc = new THREE.QuadraticBezierCurve3(this._positions[i], this._positions[i + 1], this._positions[i + 2]);
                curve.add(bc);
            }
            this._curve = curve;
            this.update();
        }
    }
    //# sourceMappingURL=QuadraticBezierCurve3.js.map

    const DEFAULT_OBJECT$1 = {
        type: 'CubicBezierCurve3',
        points: [
            { x: -400, y: 120, z: 300 },
            { x: -400, y: -120, z: 300 },
            { x: 0, y: -120, z: 300 },
            { x: 0, y: 0, z: 300 },
            { x: 0, y: 120, z: 300 },
            { x: 400, y: 120, z: 300 },
            { x: 400, y: -120, z: 300 }
        ]
    };
    class CubicBezierCurve3 extends BaseCurveCurve {
        constructor(jsObj) {
            super();
            this.curveType = 'CubicBezierCurve3';
            if (!jsObj || !jsObj.points) {
                this.fromJSON(DEFAULT_OBJECT$1);
            }
            else {
                this.fromJSON(jsObj);
            }
        }
        toJSON() {
            var points = [];
            for (var i = 0; i < this._positions.length; ++i) {
                points.push({
                    x: this._positions[i].x,
                    y: this._positions[i].y,
                    z: this._positions[i].z,
                    rotation: this._rotations[i]
                });
            }
            return {
                type: this.curveType,
                points
            };
        }
        fromJSON(jsObj) {
            if (jsObj && jsObj.type === this.curveType && jsObj.points && jsObj.points.length >= 4) {
                var points = jsObj.points;
                this._positions.length = this._rotations.length = points.length;
                for (var i = 0; i < points.length; ++i) {
                    this._positions[i] = new THREE.Vector3(points[i].x || 0, points[i].y || 0, points[i].z || 0);
                    this._rotations[i] = points[i].rotation || 0;
                }
                this.rebuild();
            }
        }
        allowPointRotation(i) {
            return i % 3 == 0;
        }
        rebuild() {
            var curve = new THREE.CurvePath();
            for (var i = 0; i + 3 < this._positions.length; i += 3) {
                var bc = new THREE.CubicBezierCurve3(this._positions[i], this._positions[i + 1], this._positions[i + 2], this._positions[i + 3]);
                curve.add(bc);
            }
            this._curve = curve;
            this.update();
        }
        allowOperator(op) {
            if (op.type === 'splitBetween') {
                return this.split(op.points, true);
            }
            else if (op.type === 'removePoints') {
                return this.removePoints(op.points, true);
            }
            return false;
        }
        applyOperator(op) {
            if (op.type === 'splitBetween') {
                return this.split(op.points, false);
            }
            else if (op.type === 'removePoints') {
                return this.removePoints(op.points, false);
            }
            return false;
        }
        //check 表示只做检查，不修改曲线
        split(points, check) {
            if (!points)
                return false;
            if (!(points.length >= 1 && points.length <= 4))
                return false;
            var count = this._positions.length;
            points = points.slice().sort((a, b) => a - b);
            for (var i = 0; i < points.length; ++i) {
                if (!(points[i] >= 0 && points[i] < count))
                    return false;
                if (i + 1 < points.length && points[i] + 1 !== points[i + 1])
                    return false;
            }
            //分裂idx0到idx0 + 3之间的定点
            var idx0 = -1;
            if (points.length === 1) {
                //一定要选中一个控制点
                let pt = points[0];
                if (pt % 3 === 0)
                    return false;
                if (pt % 3 == 1) {
                    idx0 = pt - 1;
                }
                else //if (pt%3 == 2)
                 {
                    idx0 = pt - 2;
                }
            }
            else if (points.length === 2) {
                //选择其中的一个控制点
                let pt = points[0] % 3 == 0 ? points[1] : points[0];
                if (pt % 3 === 0)
                    return false;
                if (pt % 3 == 1) {
                    idx0 = pt - 1;
                }
                else //if (pt%3 == 2)
                 {
                    idx0 = pt - 2;
                }
            }
            else if (points.length === 3) {
                //[0,1,2] || [1,2,3]
                if (points[0] % 3 == 0) {
                    idx0 = points[0];
                }
                else if (points[2] % 3 == 0) {
                    idx0 = points[2] - 3;
                }
                else {
                    return false;
                }
            }
            else if (points.length === 4) {
                if (points[0] % 3 === 0 && points[3] % 3 === 0) {
                    idx0 = points[0];
                }
                else {
                    return false;
                }
            }
            else {
                return false;
            }
            if (check)
                return true;
            //从idx0开始
            var result = this.generate();
            var p0 = this._positions[idx0];
            var p1 = this._positions[idx0 + 3];
            var p0idx = findClosestPointIndex(result.positions, p0);
            var p1idx = findClosestPointIndex(result.positions, p1);
            var mididx = ((p0idx + p1idx) * 0.5) | 0;
            var midpt = result.positions[mididx];
            if (!midpt)
                throw new Error('midpt is null');
            var midrot = result.rotations[mididx];
            //generate 4 control points
            //p0 -- c0 -- c1 -- mid -- c2 -- c3 -- p1
            var tan0 = result.forwards[p0idx];
            var tanmid = result.forwards[mididx];
            var tan1 = result.forwards[p1idx];
            var len0 = p0.distanceTo(midpt);
            var len1 = midpt.distanceTo(p1);
            var c0 = tan0.clone().multiplyScalar(len0 * 0.4).add(p0);
            var c1 = tanmid.clone().multiplyScalar(-len0 * 0.4).add(midpt);
            var c2 = tanmid.clone().multiplyScalar(len1 * 0.4).add(midpt);
            var c3 = tan1.clone().multiplyScalar(-len1 * 0.4).add(p1);
            this._positions.splice(idx0 + 1, 2, c0, c1, midpt, c2, c3);
            this._rotations.splice(idx0 + 1, 2, 0, 0, midrot, 0, 0);
            this.rebuild();
            return true;
        }
        removePoints(points, check) {
            if (!points || points.length !== 1)
                return false;
            var pt = points[0];
            if (pt % 3 !== 0)
                return false;
            if (this._positions.length <= 4)
                return false;
            if (!(pt >= 0 && pt < this._positions.length))
                return false;
            if (check)
                return true;
            if (pt === 0) {
                this._positions.splice(0, 2);
                this._rotations.splice(0, 2);
            }
            else if (pt === this._positions.length - 1) {
                this._positions.splice(pt - 1, 2);
                this._rotations.splice(pt - 1, 2);
            }
            else {
                this._positions.splice(pt - 1, 3);
                this._rotations.splice(pt - 1, 3);
            }
            this.rebuild();
            return true;
        }
        getHelperLine() {
            var arr = [];
            for (var i = 0; i < this._positions.length; i += 3) {
                if (i > 0)
                    arr.push(this._positions[i], this._positions[i - 1]);
                if (i < this._positions.length - 1)
                    arr.push(this._positions[i], this._positions[i + 1]);
            }
            return arr;
        }
    }
    //# sourceMappingURL=CubicBezierCurve3.js.map

    //控制形态的点的数量
    const FIX_POINT_COUNT = 2;
    class ArcCurve extends AbstractCurve //implements ICurveImpl
     {
        constructor(jsObj) {
            super();
            this.curveType = 'ArcCurve';
            this._generateQuality = 100;
            this._cacheGenerate = null;
            this._radius = 100;
            this._degreeStart = 0;
            this._degreeEnd = 360 * 1;
            this._extraPointCount = 10;
            this._positions = [
                new THREE.Vector3(-200, 0, 0),
                new THREE.Vector3(200, 0, 0),
            ];
            this._rotations = new Array(this._extraPointCount + FIX_POINT_COUNT);
            for (var i = 0; i < this._rotations.length; ++i) {
                this._rotations[i] = 0;
            }
            this.fromJSON(jsObj);
        }
        get startPoint() { return this._positions[0]; }
        get endPoint() { return this._positions[1]; }
        toJSON() {
            return {
                type: this.curveType,
                radius: this._radius,
                degreeStart: this._degreeStart,
                degreeEnd: this._degreeEnd,
                positions: this._positions.map(pt => ({ x: pt.x, y: pt.y, z: pt.z })),
                rotations: this._rotations
            };
        }
        fromJSON(obj) {
            if (obj && obj.type === this.curveType &&
                obj.positions && obj.positions.length === FIX_POINT_COUNT) {
                this._radius = obj.radius || 100;
                this._degreeStart = obj.degreeStart || 0;
                this._degreeEnd = typeof obj.degreeEnd === 'number' ? obj.degreeEnd : 720;
                for (var i = 0; i < FIX_POINT_COUNT; ++i) {
                    var pp = obj.positions[i];
                    this._positions[i].set(pp.x, pp.y, pp.z);
                }
                if (obj.rotations && obj.rotations.length >= FIX_POINT_COUNT) {
                    this._extraPointCount = obj.rotations.length - FIX_POINT_COUNT;
                    this._rotations = obj.rotations.map(x => x || 0);
                }
                else {
                    this._extraPointCount = 0;
                    this._rotations = [0, 0];
                }
                this._cacheGenerate = null;
                this.update();
            }
        }
        getInternalCurve() { return null; }
        getControlPointCount() { return this._positions.length + this._extraPointCount; }
        allowPointRotation(i) { return i >= 2; }
        allowPointTranslation(i) { return i >= 0 && i < 2; }
        getPointPosition(i, target) {
            if (i >= FIX_POINT_COUNT && i < FIX_POINT_COUNT + this._extraPointCount) {
                var idx = this._convertIndex(i);
                var cacheGenerate = this._cacheGenerate;
                if (idx < 0 || idx >= cacheGenerate.positions.length || !cacheGenerate.positions[idx] || !target) {
                    debugger;
                    this._convertIndex(i);
                }
                target.copy(cacheGenerate.positions[idx]);
            }
            else if (i >= 0 && i < this._positions.length) {
                target.copy(this._positions[i]);
            }
            else {
                console.log('invalid position index:', i);
            }
        }
        getPointRotation(i) {
            if (i >= FIX_POINT_COUNT) {
                return this._rotations[i];
            }
            return 0;
        }
        getPointForward(i, target) {
            if (i >= FIX_POINT_COUNT) {
                var idx = this._convertIndex(i);
                target.copy(this._cacheGenerate.forwards[idx]);
            }
            else {
                target.set(0, 0, 0);
            }
        }
        getPointQuaternion(i, target) {
            if (i >= FIX_POINT_COUNT) {
                var idx = this._convertIndex(i);
                target.copy(this._cacheGenerate.quaternions[idx]);
            }
            else {
                target.set(0, 0, 0, 1);
            }
        }
        setPointPosition(i, pos) {
            if (i >= 0 && i < FIX_POINT_COUNT) {
                this._positions[i].copy(pos);
                this._cacheGenerate = null;
            }
        }
        setPointRotation(i, rot) {
            if (i >= FIX_POINT_COUNT && i < this._rotations.length) {
                this._rotations[i] = rot;
                this._cacheGenerate = null;
            }
        }
        allowOperator(op) {
            return false;
        }
        applyOperator(op) {
            return false;
        }
        getParameter(key) {
            if (['radius', 'degreeStart', 'degreeEnd', 'extraPointCount'].indexOf(key) >= 0) {
                return this['_' + key];
            }
            if (key === 'generateQuality') {
                return this._generateQuality;
            }
        }
        setParameter(key, value) {
            if (typeof value === 'number' && !isNaN(value)) {
                if (key === 'radius' && value > 0) {
                    this._radius = value;
                    this._cacheGenerate = null;
                    return true;
                }
                else if (key === 'degreeStart') {
                    this._degreeStart = value;
                    this._cacheGenerate = null;
                    return true;
                }
                else if (key === 'degreeEnd') {
                    this._degreeEnd = value;
                    this._cacheGenerate = null;
                    return true;
                }
                else if (key === 'extraPointCount') {
                    if (value === (value | 0) && value >= 0) {
                        this._setExtraPoint(value);
                        return true;
                    }
                }
                else if (key === 'generateQuality') {
                    if (value > 100)
                        value = 100;
                    else if (value < 0)
                        value = 0;
                    if (this._generateQuality !== value) {
                        this._generateQuality = value;
                        this._cacheGenerate = null;
                    }
                    return true;
                }
            }
            return false;
        }
        _setExtraPoint(val) {
            if (val === this._extraPointCount)
                return;
            var oldrotations = this._rotations;
            this._rotations = new Array(val + FIX_POINT_COUNT);
            for (var i = 0; i < this._rotations.length; ++i) {
                if (i < FIX_POINT_COUNT) {
                    this._rotations[0] = 0;
                }
                else {
                    var t = (i - FIX_POINT_COUNT) / (this._rotations.length - FIX_POINT_COUNT - 1);
                    this._rotations[i] = findRotation(oldrotations, t);
                }
            }
            this._extraPointCount = val;
            this._cacheGenerate = null;
        }
        generate(numpoints) {
            var degree0 = this._degreeStart;
            var degree1 = this._degreeEnd;
            if (degree0 > degree1) {
                [degree0, degree1] = [degree1, degree0];
            }
            numpoints = numpoints || (((degree1 - degree0) + 1) | 0);
            if (this._cacheGenerate)
                return this._cacheGenerate;
            if (this._generateQuality < 100) {
                numpoints = (numpoints * this._generateQuality / 100) | 0;
                if (numpoints < 10)
                    numpoints = 10;
            }
            var positions = new Array(numpoints);
            var rotations = new Array(numpoints);
            var forwards = new Array(numpoints);
            var quaternions = new Array(numpoints);
            //首先生成rotation。只是lerp而已。
            for (var i = 0; i < numpoints; ++i) {
                rotations[i] = findRotation(this._rotations, i / (numpoints - 1));
            }
            var length = this.startPoint.distanceTo(this.endPoint);
            var zstep = length / (numpoints - 1);
            var angle0 = degree0 * Math.PI / 180.0;
            var angle1 = degree1 * Math.PI / 180.0;
            var angle_step = (angle1 - angle0) / (numpoints - 1);
            var radius = this._radius;
            var lookmat = new THREE.Matrix4();
            var ZERO = new THREE.Vector3();
            //向着Z+方向生成。然后再旋转并平移到实际的位置
            for (var i = 0; i < numpoints; ++i) {
                var a = angle0 + angle_step * i;
                var x = radius * Math.cos(a);
                var y = -radius * Math.sin(a);
                var z = -zstep * i;
                positions[i] = new THREE.Vector3(x, y, z);
                var np = new THREE.Vector3(radius * Math.cos(a - angle_step), -radius * Math.sin(a - angle_step), zstep * (i - 1));
                //.....
                //dir是 x,y,z对于i的积分
                var dir = new THREE.Vector3(-angle_step * y, angle_step * x, zstep);
                //dir.negate();
                dir.normalize();
                var up = new THREE.Vector3(x, y, zstep);
                lookmat.lookAt(ZERO, dir, up);
                quaternions[i] = new THREE.Quaternion();
                quaternions[i].setFromRotationMatrix(lookmat);
            }
            //然后，旋转到end-start的方向
            if (length > 0) {
                //z
                var dir = this.endPoint.clone().sub(this.startPoint).multiplyScalar(1 / length);
                var up; //y
                var left; //x
                if (dir.y > dir.x && dir.y > dir.z) {
                    up = new THREE.Vector3(0, 0, -1);
                }
                else {
                    up = new THREE.Vector3(0, 1, 0);
                }
                //X = Y * Z
                left = up.clone().cross(dir);
                //Y = Z * X
                up.crossVectors(dir, left);
                var rotmat = new THREE.Matrix4();
                var translatemat = new THREE.Matrix4();
                rotmat.lookAt(new THREE.Vector3(0, 0, 0), dir, up);
                translatemat.makeTranslation(this.startPoint.x, this.startPoint.y, this.startPoint.z);
                var rotquat = new THREE.Quaternion();
                rotquat.setFromRotationMatrix(rotmat);
                var mat = new THREE.Matrix4();
                mat.copy(rotmat).premultiply(translatemat);
                for (var i = 0; i < numpoints; ++i) {
                    positions[i].applyMatrix4(mat);
                    quaternions[i].premultiply(rotquat);
                    //应用rotation
                    applyRoll(quaternions[i], rotations[i]);
                }
            }
            //计算forward。可以放到上面去吗？？？
            //（放到一开始计算，需要后面旋转的。）
            for (var i = 0; i < numpoints; ++i) {
                if (i === numpoints - 1) {
                    forwards[i] = forwards[i - 1].clone();
                }
                else {
                    forwards[i] = new THREE.Vector3();
                    forwards[i].copy(positions[i + 1]).sub(positions[i]).normalize();
                }
            }
            var result = { positions, rotations, forwards, quaternions };
            this._cacheGenerate = result;
            return result;
        }
        update() {
            this.generate();
        }
        //输入i（控制点序号，从0开始，已经减去FIX_POINT_COUNT）
        //返回对应的generateresult中数据的下标
        _convertIndex(i) {
            i -= 2;
            if (i >= 0 && i < this._extraPointCount) {
                var t = i / (this._extraPointCount - 1);
                if (this._extraPointCount <= 1) {
                    t = 0;
                }
                var result = this.generate();
                var count = result.positions.length;
                var idx = Math.floor(count * t + 0.5);
                if (idx >= count) {
                    idx = count - 1;
                }
                return idx;
            }
            return -1;
        }
        getHelperLine() {
            return [this.startPoint, this.endPoint];
        }
    }
    //从2开始的rotations
    function findRotation(rotations, t) {
        var count = rotations.length - FIX_POINT_COUNT;
        if (count <= 0)
            return 0;
        if (count === 1)
            return rotations[FIX_POINT_COUNT];
        if (t <= 0)
            return rotations[FIX_POINT_COUNT];
        if (t >= 1)
            return rotations[rotations.length - 1];
        var step = 1 / (count - 1);
        var i0 = Math.floor(t / step);
        var tt = (t - i0 * step) / step;
        if (i0 >= count - 1)
            return rotations[rotations.length - 1];
        return lerpRotation(rotations[i0 + FIX_POINT_COUNT], rotations[i0 + 1 + FIX_POINT_COUNT], tt);
    }
    //# sourceMappingURL=ArcCurve.js.map

    class TranslationGhostCurve extends AbstractCurve {
        constructor(jsobj) {
            super();
            this.curveType = 'TranslationGhostCurve';
            this.isGhostCurve = true;
            this._refUUID = null;
            this._curve = null;
            this._translations = [
                new THREE.Vector3(0, 200, 0),
                new THREE.Vector3(0, -200, 0),
                new THREE.Vector3(0, 0, 200),
                new THREE.Vector3(0, 0, -200),
            ];
        }
        allowPointRotation() { return false; }
        allowPointTranslation() { return false; }
        //在每个线的头部放一个控制点
        getControlPointCount() {
            var ret = this.generateMulti();
            if (ret.length === 0)
                return 1;
            if (ret[0].positions.length === 0)
                return 1;
            return ret.length;
        }
        getPointPosition(i, target) {
            var ret = this.generateMulti();
            if (ret.length === 0 || ret[0].positions.length === 0) {
                target.set(0, 0, 0);
                return;
            }
            if (i >= 0 && i < ret.length) {
                target.copy(ret[i].positions[0]);
            }
            else {
                target.set(0, 0, 0);
            }
        }
        update() {
            super.update();
            this._cacheGenerate = null;
        }
        generate(numpoints) {
            var ret = this.generateMulti();
            if (ret.length === 0) {
                return { positions: [], rotations: [], forwards: [], quaternions: [] };
            }
            else {
                return ret[0];
            }
        }
        generateMulti() {
            if (this._cacheGenerate)
                return this._cacheGenerate;
            if (!this._curve || this._translations.length === 0 || this._curve.isGhostCurve) {
                this._cacheGenerate = [];
                return [];
            }
            var g = this._curve.generate();
            var rotations = g.rotations.slice();
            var forwards = g.forwards.slice();
            var quaternions = g.quaternions.slice();
            //this._cacheGenerate = this._translations.map(t =>
            //{
            //	var positions = g.positions.map(p => p.clone().add(t));
            //	return { positions, rotations, forwards, quaternions };
            //});
            this._cacheGenerate = new Array(this._translations.length);
            for (var i = 0; i < this._cacheGenerate.length; ++i) {
                var positions = new Array(g.positions.length);
                var t = this._translations[i];
                for (var j = 0; j < positions.length; ++j) {
                    var pp = g.positions[j];
                    positions[j] = new THREE.Vector3(t.x + pp.x, t.y + pp.y, t.z + pp.z);
                }
                this._cacheGenerate[i] = { positions, rotations, forwards, quaternions };
            }
            return this._cacheGenerate;
        }
        getParameter(key) {
            if (key === 'refUUID') {
                return this._refUUID;
            }
            if (key === 'refCurve') {
                return this._curve;
            }
        }
        setParameter(key, value) {
            if (key === 'refUUID') {
                this._refUUID = value;
                return 'norecord'; //todo:不需要undo record
            }
            if (key === 'refCurve') {
                if (value && typeof value.curveType === 'string' && typeof value.generate === 'function' && !value.isGhostCurve) {
                    this._curve = value;
                    this._cacheGenerate = null;
                    return true;
                }
            }
        }
        applyOperator(op) {
            if (op.type === 'setFormulation') {
                if (op.kind === 'box') {
                    if (op.up && op.right && op.width && op.height) {
                        return this.setBox(op);
                    }
                }
                else if (op.kind === 'circle') {
                    if (op.up && op.right && op.radius && op.count) {
                        return this.setCirlce(op);
                    }
                }
            }
            return false;
        }
        setCirlce(obj) {
            var up = new THREE.Vector3(obj.up.x, obj.up.y, obj.up.z);
            var right = new THREE.Vector3(obj.right.x, obj.right.y, obj.right.z);
            var radius = obj.radius || 0.1;
            var count = Math.floor(obj.count) || 2;
            if (count < 2)
                count = 2;
            up.normalize();
            right.normalize();
            var angle_step = Math.PI * 2 / count;
            var translations = [];
            var xtemp = new THREE.Vector3();
            var ytemp = new THREE.Vector3();
            for (var i = 0; i < count; ++i) {
                var angle = i * angle_step;
                var y = radius * Math.cos(angle);
                var x = radius * Math.sin(angle);
                xtemp.copy(right);
                xtemp.multiplyScalar(x);
                ytemp.copy(up);
                ytemp.multiplyScalar(y);
                var t = new THREE.Vector3();
                t.addVectors(xtemp, ytemp);
                translations.push(t);
            }
            this._translations = translations;
            this._cacheGenerate = null;
            return true;
        }
        setBox(obj) {
            var up = new THREE.Vector3(obj.up.x, obj.up.y, obj.up.z);
            var right = new THREE.Vector3(obj.right.x, obj.right.y, obj.right.z);
            var width = obj.width || 100;
            var height = obj.height || 100;
            var xcount = obj.xcount || 1;
            var ycount = obj.ycount || 1;
            up.normalize();
            right.normalize();
            var o = new THREE.Vector3();
            o.sub(up.clone().multiplyScalar(height * 0.5));
            o.sub(right.clone().multiplyScalar(width * 0.5));
            var translations = [];
            var xtemp = new THREE.Vector3();
            var ytemp = new THREE.Vector3();
            for (var x = 0; x < xcount; ++x) {
                xtemp.copy(right);
                xtemp.multiplyScalar(width * x / (xcount - 1));
                for (var y = 0; y < ycount; ++y) {
                    ytemp.copy(up);
                    ytemp.multiplyScalar(height * y / (ycount - 1));
                    translations.push(o.clone().add(xtemp).add(ytemp));
                }
            }
            this._translations = translations;
            this._cacheGenerate = null;
            return true;
        }
    }

    function createCurve(type, initJsonObject) {
        if (type === 'CatmullRomCurve3') {
            return new CatmullRomCurve3(initJsonObject);
        }
        else if (type === 'QuadraticBezierCurve3') {
            return new QuadraticBezierCurve3(initJsonObject);
        }
        else if (type === 'CubicBezierCurve3') {
            return new CubicBezierCurve3(initJsonObject);
        }
        else if (type === 'ArcCurve') {
            return new ArcCurve(initJsonObject);
        }
        else if (type === 'TranslationGhostCurve') {
            return new TranslationGhostCurve(initJsonObject);
        }
        console.error('create curve failed', initJsonObject);
        return null;
    }
    //# sourceMappingURL=index.js.map

    var g_CurveCount = 1;
    class CurveObject extends THREE.EventDispatcher {
        constructor(initJson) {
            super();
            this.uuid = THREE.Math.generateUUID();
            this.name = 'curve001';
            this.disposed = false;
            this.dirtyForAnimation = false;
            this.dirtyForSelection = false;
            //logic curve data changed.
            //need to update geometry and ControlPoint;
            this._logicCurveChanged = true;
            this._curveChangeBindings = [];
            this.name = `curve${g_CurveCount}`;
            ++g_CurveCount;
            this.controlPoints = [];
            this.curve = createCurve(initJson.type, initJson);
            this.geometry = new THREE.BufferGeometry();
            var attr = new THREE.BufferAttribute(new Float32Array(0), 3, false);
            attr.setDynamic(true);
            this.geometry.addAttribute('position', attr);
            this.material = new THREE.LineBasicMaterial({
                color: 0xffffff,
                opacity: 1,
                linewidth: 2,
                depthTest: true,
                depthWrite: true,
                depthFunc: THREE.AlwaysDepth,
            });
            this.line = new THREE.Line(this.geometry, [this.material]);
            this.line.renderOrder = 20;
            this.line.matrixAutoUpdate = false;
            this.line.frustumCulled = false;
            var helpLineBuffer = new THREE.BufferGeometry();
            var helpLineMaterial = new THREE.LineDashedMaterial({
                color: 0xffff00,
                depthTest: true,
                depthWrite: true,
                depthFunc: THREE.AlwaysDepth,
                gapSize: 5,
                dashSize: 10,
                scale: 1
            });
            helpLineBuffer.addAttribute('position', new THREE.BufferAttribute(new Float32Array(0), 3).setDynamic(true));
            this.helpLine = new THREE.LineSegments(helpLineBuffer, helpLineMaterial);
            this.line.add(this.helpLine);
            this._updateCurveToControlPoint();
            this._updateGeometry();
        }
        static GetSupportedCurveTypes() {
            return ['CatmullRomCurve3', 'QuadraticBezierCurve3'];
        }
        get color() { return '#' + this.material.color.getHexString(); }
        set color(val) { this.material.color.set(val); }
        get visible() { return this.line.visible; }
        set visible(val) {
            if (this.line.visible !== val) {
                this.line.visible = val;
                for (var cp of this.controlPoints) {
                    cp.visible = val;
                }
                app.getUI().refreshSelectionControlPoints();
            }
        }
        toJSON() {
            var obj = this.curve.toJSON();
            obj.uuid = this.uuid;
            return obj;
        }
        fromJSON(obj) {
            if (obj.type === this.curve.curveType) {
                this.curve.fromJSON(obj);
                this._updateCurveToControlPoint();
                if (typeof obj.uuid === 'string') {
                    this.uuid = obj.uuid;
                }
                this._logicCurveChanged = true;
            }
        }
        update() {
            if (this._logicCurveChanged) {
                this._logicCurveChanged = false;
                this.curve.update();
                this._updateCurveToControlPoint();
                this._updateGeometry();
                this.dispatchEvent({ type: 'change', curve: this });
                this.dirtyForAnimation = true;
                this.dirtyForSelection = true;
            }
        }
        _updateCurveToControlPoint() {
            var count = this.curve.getControlPointCount();
            while (this.controlPoints.length > count) {
                var cp = this.controlPoints.pop();
                cp.dispose();
            }
            while (this.controlPoints.length < count) {
                var i = this.controlPoints.length;
                var cp = new ControlPoint(this);
                this.controlPoints.push(cp);
                cp.attachTo(app);
            }
            for (var i = 0; i < this.controlPoints.length; ++i) {
                var cp = this.controlPoints[i];
                cp._updateFromLogicCurve(i, this.curve);
            }
        }
        dispose() {
            if (this.geometry) {
                this.geometry.dispose();
            }
            if (this.material) {
                this.material.dispose();
            }
            if (this.line && this.line.parent) {
                this.line.parent.remove(this.line);
            }
            if (Array.isArray(this.line.material)) {
                for (var m of this.line.material) {
                    m.dispose();
                }
            }
            else {
                this.line.material.dispose();
            }
            for (var cp of this.controlPoints) {
                cp.dispose();
            }
            this.disposed = true;
            this.dispatchEvent({ type: 'dispose', curve: this });
        }
        attachTo(app) {
            this._app = app;
            app.scene.add(this.line);
            this.line.add(this.helpLine);
            for (var cp of this.controlPoints)
                cp.attachTo(app);
        }
        generateAnimationClip(duration) {
            if (!duration)
                duration = 5;
            var genresult = this.curve.generate();
            var count = genresult.positions.length;
            var times = [];
            for (var i = 0; i < count; ++i) {
                times.push(i / (count - 1) * duration);
            }
            var flatPos = new Array(count * 3);
            for (var i = 0; i < count; ++i) {
                flatPos[i * 3 + 0] = genresult.positions[i].x;
                flatPos[i * 3 + 1] = genresult.positions[i].y;
                flatPos[i * 3 + 2] = genresult.positions[i].z;
            }
            var positionTrack = new THREE.VectorKeyframeTrack('.position', times, flatPos, THREE.InterpolateLinear);
            var flatRot = new Array(count * 4);
            for (i = 0; i < count; ++i) {
                flatRot[i * 4 + 0] = genresult.quaternions[i].x;
                flatRot[i * 4 + 1] = genresult.quaternions[i].y;
                flatRot[i * 4 + 2] = genresult.quaternions[i].z;
                flatRot[i * 4 + 3] = genresult.quaternions[i].w;
            }
            var rotationTrack = new THREE.QuaternionKeyframeTrack('.quaternion', times, flatRot, THREE.InterpolateLinear);
            return new THREE.AnimationClip('noname', duration, [positionTrack, rotationTrack]);
        }
        _updateGeometry() {
            var geometry = this.geometry;
            var attr = geometry.getAttribute('position');
            var results = this.curve.generateMulti();
            //support multi lines
            var totalPoints = 0;
            for (var i = 0; i < results.length; ++i)
                totalPoints += results[i].positions.length;
            if (attr.array.length < totalPoints * 3) {
                attr = new THREE.BufferAttribute(new Float32Array(totalPoints * 3 + 50 * 3), 3);
                geometry.removeAttribute('position');
                geometry.addAttribute('position', attr);
            }
            //copy pos
            var array = attr.array;
            geometry.clearGroups();
            let offset = 0;
            for (var i = 0; i < results.length; ++i) {
                var g = results[i];
                geometry.addGroup(offset / 3, g.positions.length, 0);
                //console.log(`addgroup`, offset, g.positions.length);
                for (var j = 0; j < g.positions.length; ++j) {
                    var p = g.positions[j];
                    array[offset++] = p.x;
                    array[offset++] = p.y;
                    array[offset++] = p.z;
                }
            }
            attr.count = totalPoints;
            attr.needsUpdate = true;
            if (geometry.boundingSphere)
                geometry.boundingSphere.radius = 99999999999999999;
            //update helpline
            var helpLine = this.helpLine;
            var helpLineGeom = helpLine.geometry;
            var helpLineAttr = helpLineGeom.getAttribute('position');
            var helpLineData = this.curve.getHelperLine();
            if (helpLineData.length > helpLineAttr.array.length) {
                helpLineAttr = new THREE.BufferAttribute(new Float32Array(helpLineData.length * 3 + 10 * 3), 3);
                helpLineGeom.addAttribute('position', helpLineAttr);
            }
            helpLineAttr.copyVector3sArray(helpLineData);
            helpLineAttr.count = helpLineData.length;
            helpLineGeom.setDrawRange(0, helpLineData.length);
            helpLineAttr.needsUpdate = true;
            helpLine.computeLineDistances();
            if (helpLineGeom.boundingSphere)
                helpLineGeom.boundingSphere.radius = 999999999999999;
            this.dirtyForAnimation = true;
        }
        //operations
        applyMoveToPoint(index, pt) {
            //if (this.curve.allowPointTranslation(index))
            {
                this.curve.setPointPosition(index, pt);
                this._logicCurveChanged = true;
            }
        }
        applyMoveByOffset(index, pt) {
            //if (this.curve.allowPointTranslation(index))
            {
                var tmp = new THREE.Vector3();
                this.curve.getPointPosition(index, tmp);
                tmp.add(pt);
                this.curve.setPointPosition(index, tmp);
                this._logicCurveChanged = true;
            }
        }
        applyPointRotation(index, rot) {
            this.curve.setPointRotation(index, rot);
            this._logicCurveChanged = true;
        }
        applyPointRotationDelta(index, delta) {
            var rot = this.curve.getPointRotation(index) + delta;
            this.curve.setPointRotation(index, rot);
            this._logicCurveChanged = true;
        }
        allowOperator(op) { return this.curve.allowOperator(op); }
        applyOperator(op) {
            var ret = this.curve.applyOperator(op);
            if (ret) {
                this._logicCurveChanged = true;
                this.curve.update();
                this._updateCurveToControlPoint();
            }
            return ret;
        }
        setParameter(key, value) {
            var ret = this.curve.setParameter(key, value);
            if (ret) {
                this._logicCurveChanged = true;
                this.curve.update();
                this._updateCurveToControlPoint();
            }
            return ret;
        }
        getParameter(key) { return this.curve.getParameter(key); }
        //绑定一个曲线。
        bindCurveChange(curve) {
            if (curve === this) {
                console.warn('warning: cant bind to self');
                return;
            }
            if (curve.disposed) {
                console.warn('warning: cant bind to a disposed curve object');
                return;
            }
            if (this._curveChangeBindings.some(bd => bd.curve === curve)) {
                console.warn('warning: alread bind the curve');
                return;
            }
            var self = this;
            function onChange(e) {
                self._logicCurveChanged = true;
            }
            function onDispose(e) {
                self.unbindCurveChange(curve);
            }
            function dispose() {
                curve.removeEventListener('change', onChange);
                curve.removeEventListener('dispose', onDispose);
            }
            curve.addEventListener('change', onChange);
            curve.addEventListener('dispose', onDispose);
            this._curveChangeBindings.push({
                curve: curve,
                dispose: dispose
            });
        }
        unbindCurveChange(curve) {
            for (var i = 0; i < this._curveChangeBindings.length; ++i) {
                if (this._curveChangeBindings[i].curve === curve) {
                    var bd = this._curveChangeBindings[i];
                    this._curveChangeBindings.splice(i, 1);
                    bd.dispose();
                    break;
                }
            }
        }
        hasBindingCurveChange(curve) {
            return this._curveChangeBindings.some(bd => bd.curve === curve);
        }
        clearBindingCurveChange() {
            for (var i = this._curveChangeBindings.length - 1; i >= 0; --i) {
                this._curveChangeBindings[i].dispose();
            }
            this._curveChangeBindings.length = 0;
        }
    }
    /*
    const ZERO = new THREE.Vector3(0, 0, 0);
    const ROT_MAT = new THREE.Matrix4();
    const UP = new THREE.Vector3();
    function adjustLookAt(q: THREE.Quaternion, target: THREE.Vector3)
    {
        ROT_MAT.makeRotationFromQuaternion(q);
        UP.setFromMatrixColumn(ROT_MAT, 1);
        ROT_MAT.lookAt(target, ZERO, UP);
        q.setFromRotationMatrix(ROT_MAT);
    }*/
    /*
    function findClosestPointIndex(arr: THREE.Vector3[], pt: THREE.Vector3)
    {
        var idx = 0;
        var dist = Number.MAX_VALUE;
        for (var i = 0; i < arr.length; ++i)
        {
            var dist2 = pt.distanceToSquared(arr[i]);
            if (dist2 < dist)
            {
                idx = i;
                dist = dist2;
            }
        }
        return idx;
    }
    */
    /*
    const Z_AXIS = new THREE.Vector3(0, 0, 1);
    const TEMP_Q = new THREE.Quaternion;
    function calcRotation(previousQuaternion: THREE.Quaternion, previousTarget: THREE.Vector3,
        previousRotation: number,
        quaternion: THREE.Quaternion, forward: THREE.Vector3, rotation: number)
    {
        if (!previousQuaternion)
        {
            quaternion.setFromUnitVectors(Z_AXIS, forward);
            var q1 = TEMP_Q;
            q1.setFromAxisAngle(Z_AXIS, rotation / 180 * Math.PI);
            quaternion.multiply(q1);
        }
        else
        {
            quaternion.copy(previousQuaternion);
            TEMP_Q.setFromUnitVectors(previousTarget, forward);
            quaternion.premultiply(TEMP_Q);

            TEMP_Q.setFromAxisAngle(Z_AXIS, (rotation - previousRotation) / 180 * Math.PI);
            quaternion.multiply(TEMP_Q);
        }

    }*/ 
    //# sourceMappingURL=CurveObject.js.map

    class ObjectPickControl extends THREE.EventDispatcher {
        constructor(app) {
            super();
            this.objects = [];
            this._camera = app.camera;
            this._domElement = app.domElement;
            this._rayCaster = new THREE.Raycaster();
            var self = this;
            var tempArray = [];
            var lastHovered = null;
            function onMouseMove(e) {
                var obj = self.pickNearest(e, tempArray);
                if (obj !== lastHovered) {
                    self.dispatchEvent({ type: obj ? 'hoveron' : 'hoveroff', object: obj, originalEvent: e });
                }
                if (lastHovered && obj !== lastHovered) {
                    lastHovered.dispatchEvent({ type: 'hoveroff', object: lastHovered, originalEvent: e });
                    lastHovered = null;
                }
                if (obj !== lastHovered) {
                    lastHovered = obj;
                    lastHovered.dispatchEvent({ type: 'hoveron', object: lastHovered, originalEvent: e });
                }
            }
            function onMouseDown(e) {
                var obj = self.pickNearest(e, tempArray);
                if (obj) {
                    obj.dispatchEvent({ type: 'mousedown', object: obj, originalEvent: e });
                }
                self.dispatchEvent({ type: 'mousedown', object: obj, originalEvent: e });
            }
            function onMouseUp(e) {
                var obj = self.pickNearest(e, tempArray);
                if (obj) {
                    obj.dispatchEvent({ type: 'mouseup', object: obj, originalEvent: e });
                }
                self.dispatchEvent({ type: 'mouseup', object: obj, originalEvent: e });
            }
            function onMouseLeave(e) {
                if (lastHovered) {
                    lastHovered.dispatchEvent({ type: 'hoveroff', object: lastHovered, originalEvent: e });
                    lastHovered = null;
                }
            }
            var dom = app.domElement;
            dom.addEventListener('mousemove', onMouseMove, false);
            dom.addEventListener('mousedown', onMouseDown, false);
            dom.addEventListener('mouseup', onMouseUp, false);
            dom.addEventListener('mouseleave', onMouseLeave, false);
            this._removeEventFunc = function () {
                dom.removeEventListener('mousemove', onMouseMove, false);
                dom.removeEventListener('mousedown', onMouseDown, false);
                dom.removeEventListener('mouseup', onMouseUp, false);
                dom.removeEventListener('mouseleave', onMouseLeave, false);
            };
        }
        pick(e, array) {
            if (array)
                array.length = 0;
            var rect = this._domElement.getBoundingClientRect();
            var mouse = {
                x: ((e.clientX - rect.left) / rect.width) * 2 - 1,
                y: -((e.clientY - rect.top) / rect.height) * 2 + 1
            };
            this._rayCaster.setFromCamera(mouse, this._camera);
            array = this._rayCaster.intersectObjects(this.objects, true, array);
            array.sort((a, b) => {
                return a.distance - b.distance;
            });
            return array;
        }
        pickNearest(e, array) {
            array = this.pick(e, array);
            for (var ob of array) {
                var realObj = ob.object;
                while (true) {
                    if (this.objects.indexOf(realObj) >= 0)
                        break;
                    if (!realObj.parent)
                        break;
                    realObj = realObj.parent;
                }
                if (realObj['disablePick'] !== true) {
                    return realObj;
                }
            }
            return null;
        }
        dispose() {
            if (this._removeEventFunc) {
                this._removeEventFunc();
            }
        }
    }
    //# sourceMappingURL=ObjectPickControl.js.map

    class EventDispatcherHelper {
        constructor(e) {
            this._record = [];
            this.evtDisp = e;
        }
        add(name, func, arg0, arg1) {
            this.evtDisp.addEventListener(name, func, arg0, arg1);
            this._record.push([name, func, arg0, arg1]);
            return this;
        }
        dispose() {
            for (var arr of this._record) {
                this.evtDisp.removeEventListener(arr[0], arr[1], arr[2], arr[3]);
            }
        }
    }
    function WrapEventDispatcher(e) {
        return new EventDispatcherHelper(e);
    }
    //# sourceMappingURL=EventDispatcherHelper.js.map

    const AXIS = {
        'X': new THREE.Vector3(1, 0, 0),
        'Y': new THREE.Vector3(0, 1, 0),
        'Z': new THREE.Vector3(0, 0, 1),
    };
    class PlaneDragControl extends THREE.EventDispatcher {
        constructor(scene, camera, domElement) {
            super();
            this.toDispose = [];
            this._rayCaster = new THREE.Raycaster();
            this._mouse = new THREE.Vector2;
            this._castPlane = new THREE.Plane();
            this._hoving = false;
            this._draging = false;
            this._previousPosition = new THREE.Vector3();
            this._currentPosition = new THREE.Vector3();
            this.scene = scene;
            this.camera = camera;
            this.domElement = domElement;
            this.eventHelper = WrapEventDispatcher(domElement)
                .add('mousedown', e => this._onMouseDown(e), false)
                .add('mouseup', e => this._onMouseUp(e), false)
                .add('mousemove', e => this._onMouseMove(e), false)
                .add('mouseleave', e => this._onMouseLeave(e), false)
                .add('touchstart', e => this._onMouseDown(e), false)
                .add('touchmove', e => this._onMouseMove(e))
                .add('touchend', e => this._onMouseUp(e));
            //gizmos
            var geom = new THREE.PlaneBufferGeometry(1, 1);
            var mat = new THREE.MeshBasicMaterial({
                color: 0xffff00,
                opacity: 0.2,
                transparent: true,
                side: THREE.DoubleSide,
                polygonOffset: true,
                polygonOffsetFactor: 1.0,
                polygonOffsetUnits: 1.0
            });
            this.gizmos = new THREE.Mesh(geom, mat);
            this.toDispose.push(geom, mat);
            this.scene.add(this.gizmos);
            this.gizmos.visible = false;
            this.gridPlane = new THREE.GridHelper(10, 30, new THREE.Color('blue'), new THREE.Color('lightblue'));
            this.scene.add(this.gridPlane);
            this.gridPlane.visible = false;
            this.gridPlane.material.opacity = 0.2;
            this.setPlane('Z');
            this.setScale(50.0);
            this.updateGizmos();
        }
        setPlane(s) {
            var d90 = Math.PI * 0.5;
            if (s === 'X' || s === 'YZ') {
                this.gizmos.rotation.set(0, d90, 0);
                this.gridPlane.rotation.set(0, 0, d90);
            }
            else if (s === 'Y' || s === 'XZ') {
                this.gizmos.rotation.set(d90, 0, 0);
                this.gridPlane.rotation.set(0, 0, 0);
            }
            else if (s === 'Z' || s === 'XY') {
                this.gizmos.rotation.set(0, 0, 0);
                this.gridPlane.rotation.set(d90, 0, 0);
            }
            else
                return;
            //this.gridPlane.rotation.copy(this.gizmos.rotation);
            this.plane = s;
        }
        //some events
        _prepareMouse(event) {
            var rect = this.domElement.getBoundingClientRect();
            this._mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
            this._mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
            this._rayCaster.setFromCamera(this._mouse, this.camera);
        }
        _TestCastPlane(target) {
            if (this._rayCaster.ray.intersectPlane(this._castPlane, target))
                return target;
            this._castPlane.normal.negate();
            if (this._rayCaster.ray.intersectPlane(this._castPlane, target))
                return target;
            return null;
        }
        triggerDrag(e) {
            this._onMouseDown(e, true);
        }
        _onMouseDown(e, force) {
            if (!this.object)
                return;
            this._prepareMouse(e);
            if (!this._draging) {
                var intersects = this._rayCaster.intersectObject(this.gizmos, true);
                this._hoving = intersects.length > 0;
                if (force && !this._hoving) {
                    this._hoving = true;
                    this.updateGizmos();
                }
                //here, start draging
                if (this._hoving || force) {
                    e.preventDefault();
                    e.stopPropagation();
                    this._draging = true;
                    this.gridPlane.visible = true;
                    this.gridPlane.position.copy(this.object.position);
                    //prepare plane
                    this._castPlane.setFromNormalAndCoplanarPoint(AXIS[this.plane], this.object.position);
                    if (!this._TestCastPlane(this._previousPosition)) {
                        this._previousPosition.copy(this.object.position);
                    }
                    this.dispatchEvent({ type: 'mouseDown' });
                }
            }
        }
        _onMouseUp(e) {
            if (this._draging) {
                if (e)
                    e.preventDefault();
                //e.stopPropagation();
                this._draging = false;
                this.gridPlane.visible = false;
                if (this.object) {
                    this.dispatchEvent({ type: 'mouseUp' });
                }
            }
        }
        _onMouseMove(e) {
            if (!this.object)
                return;
            e.preventDefault();
            this._prepareMouse(e);
            if (this._draging) {
                e.stopPropagation();
                if (this._TestCastPlane(this._currentPosition)) {
                    var x = this._currentPosition.x - this._previousPosition.x;
                    var y = this._currentPosition.y - this._previousPosition.y;
                    var z = this._currentPosition.z - this._previousPosition.z;
                    if (this.plane === 'X')
                        x = 0;
                    else if (this.plane === 'Y')
                        y = 0;
                    else if (this.plane === 'Z')
                        z = 0;
                    this.object.position.add(new THREE.Vector3(x, y, z));
                    this._previousPosition.copy(this._currentPosition);
                    this.dispatchEvent({ type: 'objectChange' });
                }
            }
            else {
                //check hover
                var intersects = this._rayCaster.intersectObject(this.gizmos, true);
                this._hoving = intersects.length > 0;
            }
            this.updateGizmos();
        }
        _onMouseLeave(e) {
            this._onMouseUp(e);
        }
        attachObject(obj) {
            if (obj === this.object) {
                this.updateGizmos();
                if (this._draging) {
                    //todo:....
                }
                return;
            }
            if (this.object) {
                this.detachObject();
            }
            this.object = obj;
            this.updateGizmos();
        }
        detachObject() {
            if (this.object) {
                this.object = null;
                if (this._hoving)
                    this._hoving = false;
                if (this._draging)
                    this._draging = false;
                this.gridPlane.visible = false;
                this.updateGizmos();
            }
        }
        setScale(val) {
            this.gizmos.scale.setScalar(val);
            this.gridPlane.scale.setScalar(val);
        }
        updateGizmos() {
            if (this.object) {
                this.gizmos.visible = true;
                var m = this.gizmos.material;
                m.opacity = this._hoving ? 0.9 : 0.2;
                if (this.object) {
                    this.gizmos.position.copy(this.object.position);
                }
            }
            else {
                this.gizmos.visible = false;
            }
        }
        dispose() {
            for (var x of this.toDispose) {
                x.dispose();
            }
            this.toDispose.length = 0;
            this.scene.remove(this.gizmos);
            this.scene.remove(this.gridPlane);
            this.eventHelper.dispose();
        }
    }
    //# sourceMappingURL=PlaneDragControl.js.map

    class ControlPointSelection {
        constructor(app) {
            /**选中的控制点 */
            this.selections = [];
            this.controlMode = 'drag';
            this.dummy = new THREE.Object3D;
            this.lastPosition = new THREE.Vector3();
            this.lastRotation = new THREE.Quaternion();
            //private gui: dat.GUI;
            this.changedDuringMouseDown = false;
            this.app = app;
            this.transformControl = new THREE.TransformControls(app.camera, app.domElement);
            app.scene.add(this.transformControl);
            app.scene.add(this.dummy);
            this.transformControl.visible = false;
            this.transformControl.setSpace('world');
            this.transformControl.addEventListener('objectChange', e => this.onChange());
            this.transformControl.addEventListener('mouseDown', e => this.onTransformControlMouseDown());
            this.transformControl.addEventListener('mouseUp', e => this.onTransformControlMouseUp());
            window.addEventListener('keydown', e => this.onKeyDown(e));
            this.dragControl = new PlaneDragControl(app.scene, app.camera, app.domElement);
            this.dragControl.addEventListener('objectChange', e => this.onChange());
            this.dragControl.addEventListener('mouseDown', e => this.onTransformControlMouseDown());
            this.dragControl.addEventListener('mouseUp', e => this.onTransformControlMouseUp());
        }
        /**选中的曲线 */
        get selectionCurves() {
            var arr = [];
            for (var cp of this.selections) {
                if (arr.indexOf(cp.curve) < 0)
                    arr.push(cp.curve);
            }
            return arr;
        }
        get onlyOneSelectedCurve() {
            if (this.selections.length === 0)
                return null;
            var curve = this.selections[0].curve;
            for (var cp of this.selections) {
                if (cp.curve !== curve)
                    return null;
            }
            return curve;
        }
        //#region all command
        cmd_isAllowRemovePoints() {
            if (this.selectionCurves.length === 1) {
                return this.selectionCurves[0].allowOperator({
                    type: 'removePoints',
                    points: this.selections.map(cp => cp.index)
                });
            }
            return false;
        }
        cmd_applyRemovePoints() {
            if (this.selectionCurves.length === 1) {
                var op = {
                    type: 'removePoints',
                    points: this.selections.map(cp => cp.index)
                };
                app.recordCurveModify(this.selectionCurves[0]);
                this.selectionCurves[0].applyOperator(op);
                this.clear();
            }
            return false;
        }
        cmd_isAllowSplit() {
            if (this.selectionCurves.length === 1) {
                var op = {
                    type: 'splitBetween',
                    points: this.selections.map(cp => cp.index)
                };
                return this.selectionCurves[0].allowOperator(op);
            }
        }
        cmd_applySplit() {
            if (this.selectionCurves.length === 1) {
                var op = {
                    type: 'splitBetween',
                    points: this.selections.map(cp => cp.index)
                };
                app.recordCurveModify(this.selectionCurves[0]);
                this.selectionCurves[0].applyOperator(op);
            }
        }
        //选中整条曲线
        cmd_isAllowSelectAll() {
            return !!this.onlyOneSelectedCurve;
        }
        cmd_selectAll() {
            var curve = this.onlyOneSelectedCurve;
            if (curve) {
                var last = this.selections[this.selections.length - 1];
                for (var cp of curve.controlPoints) {
                    if (this.selections.indexOf(cp) < 0)
                        this.add(cp);
                }
                this.add(last);
            }
        }
        cmd_isAllowRemoveCurve() {
            return !!this.onlyOneSelectedCurve;
        }
        cmd_removeCurve() {
            var curve = this.onlyOneSelectedCurve;
            if (curve) {
                app.recordRemoveCurve(curve);
                app.removeCurve(curve);
                this.clear();
            }
        }
        //#endregion
        _resetControl() {
            if (this.selections.length === 0) {
                this.transformControl.visible = false;
                this.transformControl.detach();
                this.dragControl.detachObject();
            }
            else {
                var last = this.selections[this.selections.length - 1];
                this.dummy.position.copy(last.mesh.position);
                if (this.selections.length == 1) {
                    this.dummy.quaternion.copy(last.mesh.quaternion);
                }
                this.lastPosition.copy(this.dummy.position);
                this.lastRotation.copy(this.dummy.quaternion);
                if (this.controlMode === 'translate') {
                    this.dragControl.detachObject();
                    this.transformControl.visible = true;
                    this.transformControl.attach(this.dummy);
                }
                else if (this.controlMode === 'drag') {
                    //clear transform
                    this.transformControl.visible = false;
                    this.transformControl.detach();
                    this.dragControl.attachObject(this.dummy);
                }
                else {
                    this.transformControl.visible = false;
                    this.transformControl.detach();
                    this.dragControl.detachObject();
                }
            }
        }
        isIntersectControl(e) {
            if (!this.transformControl.visible)
                return false;
            return this.transformControl['axis'] != null;
        }
        tryTriggerDrag(e) {
            if (this.selections.length === 1 && this.controlMode === 'drag') {
                this.dragControl.triggerDrag(e);
                return true;
            }
            return false;
        }
        add(pt) {
            var pos = this.selections.indexOf(pt);
            if (pos < 0) {
                this.selections.push(pt);
                pt.selected = true;
                this._resetControl();
            }
            else if (pos != this.selections.length - 1) {
                this.selections.splice(pos, 1);
                this.selections.push(pt);
                this._resetControl();
            }
            //this.gui.updateDisplay();
            app.getUI().refreshSelectionControlPoints();
        }
        remove(pt) {
            var pos = this.selections.indexOf(pt);
            if (pos >= 0) {
                this.selections.splice(pos, 1);
                pt.selected = false;
                this._resetControl();
            }
            //this.gui.updateDisplay();
            app.getUI().refreshSelectionControlPoints();
        }
        isInSelection(pt) {
            return this.selections.indexOf(pt) >= 0;
        }
        toggle(pt) {
            if (this.isInSelection(pt))
                this.remove(pt);
            else
                this.add(pt);
        }
        clear() {
            if (this.selections.length > 0) {
                for (var cp of this.selections) {
                    cp.selected = false;
                }
                this.selections.length = 0;
                this._resetControl();
            }
            //this.gui.updateDisplay();
            app.getUI().refreshSelectionControlPoints();
        }
        onChange() {
            if (this.controlMode === 'translate' || this.controlMode === 'drag') {
                //if (this.transformControl.getMode() === 'translate')
                {
                    var offset = this.dummy.position.clone().sub(this.lastPosition);
                    this.lastPosition.copy(this.dummy.position);
                    var curveToUpdate = [];
                    var hasmove = false;
                    for (var cp of this.selections) {
                        if (cp.allowTranslation) {
                            cp.curve.applyMoveByOffset(cp.index, offset);
                            hasmove = true;
                            if (curveToUpdate.indexOf(cp.curve) < 0)
                                curveToUpdate.push(cp.curve);
                        }
                    }
                    for (var cv of curveToUpdate) {
                        cv.update();
                    }
                    if (this.selections.length === 1) {
                        this.dummy.quaternion.copy(this.selections[0].mesh.quaternion);
                    }
                    if (hasmove) {
                        this.changedDuringMouseDown = true;
                    }
                    else {
                        var last = this.selections[this.selections.length - 1];
                        if (last) {
                            this.dummy.position.copy(last.mesh.position);
                        }
                    }
                }
            }
            app.getUI().refreshSelectionControlPoints();
        }
        onKeyDown(e) {
            if (e.key === 'w') {
                this.controlMode = 'translate';
                this.transformControl.setMode('translate');
                this._resetControl();
            }
            else if (e.key === 'e') {
                this.controlMode = 'drag';
                this._resetControl();
            }
            else if (e.key === 'q') {
                this.controlMode = '';
                this._resetControl();
            }
            else if (e.key === 'Escape') {
                this.clear();
            }
        }
        refreshSelection() {
            for (var i = 0; i < this.selections.length; ++i) {
                var cp = this.selections[i];
                if (cp.curve.controlPoints.indexOf(cp) < 0 || app.curves.indexOf(cp.curve) < 0) {
                    this.selections.splice(i, 1);
                    --i;
                }
            }
            this._resetControl();
            this.update();
        }
        update() {
            var changed = false;
            for (var cp of this.selectionCurves) {
                if (cp.dirtyForSelection) {
                    cp.dirtyForSelection = false;
                    changed = true;
                }
            }
            if (changed) {
                this._resetControl();
                app.getUI().refreshSelectionControlPoints();
            }
            this.transformControl.update();
        }
        onTransformControlMouseDown() {
            var cc = [];
            for (var cp of this.selections) {
                if (cc.indexOf(cp.curve) < 0 && cp.allowTranslation)
                    cc.push(cp.curve);
            }
            if (cc.length > 0) {
                app.recordCurveModify(cc);
            }
            this.changedDuringMouseDown = false;
        }
        onTransformControlMouseUp() {
            if (!this.changedDuringMouseDown) {
                app.removeRecord();
            }
        }
        dispose() {
            this.transformControl.parent.remove(this.transformControl);
            this.dummy.parent.remove(this.dummy);
        }
    }
    //# sourceMappingURL=ControlPointSelection.js.map

    class AnimationPreviewControl {
        constructor() {
            this._enable = false;
            this._clip = null;
            this._mixer = null;
            this._action = null;
            this._time = 0;
            this._playing = false;
            this._timeScale = 1;
            this._curveDirty = false;
            this._createPreviewObject();
            this._previewObject.visible = this._enable;
            //var gui = app.rootGui.addFolder('Animation');
            //gui.add(this, 'enable');
            //gui.add(this, 'play');
            //gui.add(this, 'pause');
            //gui.add(this, '_timeScale', 0, 4);
            //gui.open();
        }
        get isPlaying() {
            return this._playing && this.enable;
        }
        get timeScale() { return this._timeScale; }
        set timeScale(val) { this._timeScale = val; }
        play(curve) {
            if (!this._playing || !this.enable) {
                this._curve = curve;
                this.enable = true;
                this._action.play();
                this._playing = true;
            }
        }
        pause() {
            if (this._playing) {
                this._playing = false;
            }
        }
        stop() {
            this.enable = false;
        }
        get enable() { return this._enable; }
        set enable(val) {
            if (val !== this._enable) {
                this._enable = val;
                this._previewObject.visible = val;
                if (val) {
                    this._updateCurveAnimation();
                }
            }
        }
        _updateCurveAnimation() {
            if (!this._curve) {
                this._curve = app.selection.selectionCurves[0];
                if (!this._curve)
                    this._curve = app.curves[0];
                if (!this._curve)
                    return;
            }
            var clip = this._clip = this._curve.generateAnimationClip(5.0);
            var mixer = this._mixer = new THREE.AnimationMixer(this._previewObject);
            var action = this._action = mixer.clipAction(clip);
            if (this._playing)
                action.play();
        }
        _createPreviewObject() {
            if (this._previewObject) {
                app.scene.remove(this._previewObject);
                this._previewObject['dispose']();
                this._previewObject = null;
            }
            var box = new THREE.Group();
            app.scene.add(box);
            this._previewObject = box;
            this.loadExampleFish(box);
            // var geom = new THREE.BoxBufferGeometry(0.2, 0.2, 0.2);
            // var mat = new THREE.MeshLambertMaterial({
            // 	color: 0x000000,
            // 	transparent: true,
            // 	opacity: 0.2
            // });
            // var box = new THREE.Mesh(geom, mat);
            // box.scale.setScalar(100);
            // {
            // 	var geom2 = new THREE.BoxBufferGeometry(0.1, 0.1, 0.5);
            // 	var mat2 = new THREE.MeshLambertMaterial({ color: 0xff0000 });
            // 	box.add(new THREE.Mesh(geom2, mat2));
            // }
            // {
            // 	var geom3 = new THREE.BoxBufferGeometry(0.3, 0.02, 0.4);
            // 	var mat3 = new THREE.MeshLambertMaterial({ color: 0x0000ff });
            // 	box.add(new THREE.Mesh(geom3, mat3));
            // }
            const ARROW_SCALE = 20.2;
            box.add(new THREE.ArrowHelper(new THREE.Vector3(1, 0, 0), new THREE.Vector3(-1 * ARROW_SCALE, 0, 0), 2 * ARROW_SCALE, 0xff0000, 1, 2.5), new THREE.ArrowHelper(new THREE.Vector3(0, 1, 0), new THREE.Vector3(0, -1 * ARROW_SCALE, 0), 2 * ARROW_SCALE, 0x00ff00, 1, 2.5), new THREE.ArrowHelper(new THREE.Vector3(0, 0, 1), new THREE.Vector3(0, 0, -1 * ARROW_SCALE), 2 * ARROW_SCALE, 0x0000ff, 1, 2.5));
            // box['dispose'] = function ()
            // {
            // 	mat.dispose();
            // 	geom.dispose();
            // }
            return box;
        }
        loadExampleFish(box) {
            var loader = new THREE.OBJLoader();
            loader.load('res/fish.obj', (g) => {
                for (var mesh of g.children) {
                    if (mesh instanceof THREE.Mesh) {
                        if (mesh.material && mesh.material instanceof THREE.Material)
                            mesh.material.dispose();
                        var texture = new THREE.TextureLoader().load('res/gzy.jpg', t => {
                            console.log('load ok');
                        }, undefined, e => {
                            console.log('load error,', e);
                        });
                        mesh.material = new THREE.MeshLambertMaterial({ color: 0xffffff, wireframe: false, map: texture });
                        box.add(mesh);
                    }
                }
            }, e => { }, e => {
                console.error(e);
            });
        }
        update() {
            if (this._curve && this._curve.dirtyForAnimation) {
                this._curveDirty = true;
                this._curve.dirtyForAnimation = false;
            }
            if (this._enable && this._playing && this._curveDirty) {
                this._curveDirty = false;
                this._updateCurveAnimation();
            }
            if (this._enable && this._playing && this._clip) {
                this._time += app.deltaTime * this._timeScale;
                if (this._time >= this._clip.duration)
                    this._time = 0;
                this._mixer.time = this._time;
                this._action.time = this._time;
                this._mixer.update(0);
            }
        }
        dispose() {
        }
    }
    //# sourceMappingURL=AnimationPreviewControl.js.map

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
            this.min = Number.MIN_VALUE;
            this.max = Number.MAX_VALUE;
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
            var value = parseFloat(e.target.value);
            if (e.target.value === '')
                value = 0;
            if (isNaN(value)) {
                return;
            }
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
            window.addEventListener('mouseup', onMouseUp);
            window.addEventListener('mousemove', onMouseMove);
            this.isDraging = true;
            this.setState({ draging: true });
            this.dispose = function () {
                window.removeEventListener('mouseup', onMouseUp);
                window.removeEventListener('mousemove', onMouseMove);
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
    //# sourceMappingURL=NumberBox.js.map

    class ControlPointEditor extends React.Component {
        constructor(props) {
            super(props);
        }
        render() {
            var selections = app.selection.selections;
            var curves = app.selection.selectionCurves;
            if (selections.length === 0) {
                return React.createElement("div", { className: 'ControlPointEditor' }, "no selections");
            }
            var self = this;
            var alldisabled = selections.every(x => !x.allowTranslation);
            function AxisEditor(key) {
                var firstPoint = selections[0].point;
                var allsame = selections.reduce((pv, cv) => {
                    return pv && cv.point[key] === firstPoint[key];
                }, true);
                function onChangeValue(val) {
                    app.recordCurveModify(app.selection.selectionCurves);
                    selections.forEach(cp => {
                        var pt = cp.point.clone();
                        pt[key] = val;
                        cp.curve.applyMoveToPoint(cp.index, pt);
                    });
                    //app.selection.refreshSelection();
                    //self.forceUpdate();
                }
                function onChangeDelta(val) {
                    selections.forEach(cp => {
                        //cp.point[key] += val;
                        //cp.setPointDirty();
                        var pt = new THREE.Vector3();
                        pt[key] = val;
                        cp.curve.applyMoveByOffset(cp.index, pt);
                    });
                    //app.selection.refreshSelection();
                    //self.forceUpdate();
                }
                function onChangeStart() {
                    app.recordCurveModify(app.selection.selectionCurves);
                }
                var showValue;
                if (allsame) {
                    showValue = firstPoint[key];
                }
                else {
                    showValue = '--';
                }
                return React.createElement("span", { className: 'AxisEditor' },
                    key,
                    ": ",
                    React.createElement(NumberBox, { disabled: alldisabled, value: showValue, onChangeValue: onChangeValue, onChangeDelta: onChangeDelta, onChangeStart: onChangeStart }));
            }
            function RotationEditor() {
                var firstRotation = selections[0].rotation;
                var allsame = selections.reduce((lv, cv) => { return lv && cv.rotation === firstRotation; }, true);
                var alldisabled = selections.every(x => !x.allowRotation);
                var showValue = allsame ? firstRotation : '--';
                function onChangeValue(val) {
                    if (alldisabled)
                        return;
                    app.recordCurveModify(app.selection.selectionCurves);
                    for (var cp of selections) {
                        if (cp.allowRotation) {
                            cp.curve.applyPointRotation(cp.index, val);
                        }
                    }
                    app.selection.refreshSelection();
                    self.forceUpdate();
                }
                function onChangeDelta(val) {
                    if (alldisabled)
                        return;
                    for (var cp of selections) {
                        if (cp.allowRotation) {
                            //cp.rotation += val;
                            //cp.setPointDirty();
                            cp.curve.applyPointRotationDelta(cp.index, val);
                        }
                    }
                    app.selection.refreshSelection();
                    self.forceUpdate();
                }
                function onChangeStart() {
                    if (alldisabled)
                        return;
                    app.recordCurveModify(app.selection.selectionCurves);
                }
                return React.createElement("span", null,
                    "rotation: ",
                    React.createElement(NumberBox, { disabled: alldisabled, value: showValue, step: 1, onChangeValue: onChangeValue, onChangeDelta: onChangeDelta, onChangeStart: onChangeStart }));
            }
            function RemovePointsButton() {
                var disabled = !app.selection.cmd_isAllowRemovePoints();
                function onClick() {
                    app.selection.cmd_applyRemovePoints();
                    self.forceUpdate();
                }
                return React.createElement("button", { disabled: disabled, onClick: onClick }, "\u5220\u9664\u9009\u4E2D\u7684\u70B9");
            }
            function SplitButton() {
                var disabled = !app.selection.cmd_isAllowSplit();
                function onClick() {
                    app.selection.cmd_applySplit();
                }
                return React.createElement("button", { disabled: disabled, onClick: onClick }, "\u5206\u88C2/\u63D2\u5165\u5B9A\u70B9");
            }
            var showCurveType = '...';
            if (curves.length === 1) {
                showCurveType = curves[0].curve.curveType;
            }
            var Highlight = props => {
                return React.createElement("span", { style: { color: 'lightgreen' } }, props.children);
            };
            return React.createElement("div", { className: 'ControlPointEditor' },
                React.createElement("div", { style: { fontSize: '12px', whiteSpace: 'nowrap' } },
                    "\u9009\u4E2D\u4E86 ",
                    React.createElement(Highlight, null, selections.length),
                    " \u4E2A\u63A7\u5236\u70B9(\u7B2C",
                    selections.length === 1 ? selections[0].index : '...',
                    "\u4E2A)"),
                React.createElement("div", { style: { fontSize: '12px', whiteSpace: 'nowrap' } },
                    "\u9009\u4E2D\u4E86 ",
                    React.createElement(Highlight, null, curves.length),
                    " \u6761\u66F2\u7EBF(",
                    React.createElement(Highlight, null, showCurveType),
                    ")"),
                React.createElement("div", null,
                    AxisEditor('x'),
                    AxisEditor('y'),
                    AxisEditor('z')),
                React.createElement("div", null, RotationEditor()),
                React.createElement("div", null,
                    RemovePointsButton(),
                    " ",
                    SplitButton()));
        }
    }
    //# sourceMappingURL=ControlPointEditor.js.map

    var FORMS = {
        'box': {
            _name: '方块',
            kind: 'box',
            width: 300,
            height: 300,
            xcount: 5,
            ycount: 5,
            up: { x: 0, y: 1, z: 0 },
            right: { x: 0, y: 0, z: -1 },
        },
        'circle': {
            _name: '圆',
            kind: 'circle',
            radius: 100,
            count: 20,
            up: { x: 0, y: 1, z: 0 },
            right: { x: 0, y: 0, z: -1 },
        }
    };
    class TranslationGhostCurveEditor extends React.Component {
        constructor(props) {
            super(props);
            this.state = { form: 'box' };
        }
        render() {
            function BindButton(props) {
                //var NullButton = <button disabled={true}>绑定</button>;
                var sels = app.selection.selectionCurves;
                if (sels.length === 1) {
                    if (sels[0].curve.curveType === 'TranslationGhostCurve' &&
                        !sels[0].curve.getParameter('refCurve')) {
                        return React.createElement("div", { style: { color: 'red' } }, "\u8BF7\u540C\u65F6\u9009\u62E9\u53E6\u4E00\u6761\u66F2\u7EBF\u8FDB\u884C\u7ED1\u5B9A");
                    }
                }
                if (sels.length != 2)
                    return null;
                var [one, other] = sels;
                if (!one || one.curve.curveType !== 'TranslationGhostCurve')
                    [one, other] = [other, one];
                if (!one || one.curve.curveType != 'TranslationGhostCurve')
                    return null;
                if (!other || other.curve.isGhostCurve)
                    return null;
                function bind() {
                    if (one.setParameter('refCurve', other.curve)) {
                        one.clearBindingCurveChange();
                        one.bindCurveChange(other);
                    }
                    else {
                        console.error('bind error??');
                    }
                }
                return React.createElement("div", null,
                    React.createElement("button", { onClick: bind }, "\u7ED1\u5B9A"));
            }
            return React.createElement(React.Fragment, null,
                React.createElement(BindButton, null),
                this.FormEditor());
        }
        FormEditor() {
            var curve = app.selection.onlyOneSelectedCurve;
            if (curve && curve.curve.curveType === 'TranslationGhostCurve') {
                var form = FORMS[this.state.form];
                var kindList = Object.keys(FORMS).map(key => {
                    return React.createElement("option", { value: key, key: key }, FORMS[key]._name);
                });
                var panelcss = {
                    border: '1px solid white'
                };
                var onKindChange = e => {
                    this.setState({ form: e.target.value });
                };
                function getOnChangeValueFunc(key) {
                    return function (val) {
                        form[key] = val;
                        self.setState({});
                    };
                }
                var self = this;
                var BoxForm = function () {
                    function onClick(e) {
                        var op = {
                            type: 'setFormulation',
                            kind: 'box',
                            width: form.width,
                            height: form.height,
                            xcount: Math.floor(form.xcount) || 1,
                            ycount: Math.floor(form.ycount) || 1,
                            up: form.up,
                            right: form.right
                        };
                        if (curve)
                            curve.applyOperator(op);
                    }
                    var css = { width: '120px' };
                    return React.createElement(React.Fragment, null,
                        React.createElement("div", null,
                            "\u5BBD\u5EA6\uFF1A",
                            React.createElement(NumberBox, { style: css, min: 10, max: 1000, step: 1, onChangeValue: getOnChangeValueFunc('width'), value: form.width })),
                        React.createElement("div", null,
                            "\u9AD8\u5EA6\uFF1A",
                            React.createElement(NumberBox, { style: css, min: 10, max: 1000, step: 1, onChangeValue: getOnChangeValueFunc('height'), value: form.height })),
                        React.createElement("div", null,
                            "\u6A2A\u5411\u4E2A\u6570\uFF1A",
                            React.createElement(NumberBox, { style: css, min: 1, max: 20, step: 1, onChangeValue: getOnChangeValueFunc('xcount'), value: form.xcount })),
                        React.createElement("div", null,
                            "\u7EB5\u5411\u4E2A\u6570\uFF1A",
                            React.createElement(NumberBox, { style: css, min: 1, max: 20, step: 1, onChangeValue: getOnChangeValueFunc('ycount'), value: form.ycount })),
                        React.createElement("div", null,
                            React.createElement("button", { onClick: onClick }, "\u8BBE\u7F6E")));
                };
                var CircleForm = function () {
                    var css = { width: '120px' };
                    function onClick(e) {
                        var op = {
                            type: 'setFormulation',
                            kind: 'circle',
                            radius: form.radius || 0.1,
                            count: Math.floor(form.count) || 2,
                            up: form.up,
                            right: form.right
                        };
                        if (curve)
                            curve.applyOperator(op);
                    }
                    return React.createElement(React.Fragment, null,
                        React.createElement("div", null,
                            "\u534A\u5F84\uFF1A",
                            React.createElement(NumberBox, { style: css, min: 0.1, max: 1000, step: 1, onChangeValue: getOnChangeValueFunc('radius'), value: form.radius })),
                        React.createElement("div", null,
                            "\u6570\u91CF\uFF1A",
                            React.createElement(NumberBox, { style: css, min: 2, max: 50, step: 1, onChangeValue: getOnChangeValueFunc('count'), value: form.count })),
                        React.createElement("div", null,
                            React.createElement("button", { onClick: onClick }, "\u8BBE\u7F6E")));
                };
                var CurrentForm = null;
                if (form.kind === 'box') {
                    CurrentForm = BoxForm();
                }
                else if (form.kind === 'circle') {
                    CurrentForm = CircleForm();
                }
                return React.createElement("div", { style: panelcss },
                    React.createElement("div", { style: { color: 'white', textAlign: 'center' } }, "\u9635\u578B\u8BBE\u7F6E"),
                    React.createElement("div", null,
                        "\u9635\u578B\uFF1A",
                        React.createElement("select", { style: { width: '120px' }, value: form.kind, onChange: onKindChange }, kindList)),
                    CurrentForm);
            }
            return null;
        }
    }
    //# sourceMappingURL=TranslationGhostCurveEditor.js.map

    var __rest = (window && window.__rest) || function (s, e) {
        var t = {};
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
            t[p] = s[p];
        if (s != null && typeof Object.getOwnPropertySymbols === "function")
            for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) if (e.indexOf(p[i]) < 0)
                t[p[i]] = s[p[i]];
        return t;
    };
    class IndeterminateCheckbox extends React.Component {
        componentDidMount() {
            if (this.props.indeterminate === true) {
                this._setIndeterminate(true);
            }
        }
        componentDidUpdate(previousProps) {
            if (previousProps.indeterminate !== this.props.indeterminate) {
                this._setIndeterminate(this.props.indeterminate);
            }
        }
        _setIndeterminate(indeterminate) {
            const node = ReactDOM.findDOMNode(this);
            node.indeterminate = indeterminate;
        }
        render() {
            const _a = this.props, props = __rest(_a, ["indeterminate", "type"]);
            return React.createElement("input", Object.assign({ type: "checkbox" }, props));
        }
    }
    //# sourceMappingURL=IndeterminateCheckbox.js.map

    class CurveEditor extends React.Component {
        constructor(props) {
            super(props);
        }
        render() {
            function CreateCurveButton(props) {
                function onClick() {
                    var curve = app.addNewCurve(props.type);
                    app.recordAddCurve(curve);
                }
                var css = {
                    width: '47%'
                };
                return React.createElement(React.Fragment, null,
                    React.createElement("button", { style: css, onClick: onClick }, props.name));
            }
            var css_round_box = {
                borderRadius: '5px',
                border: '1px solid white',
                padding: '4px 0 4px 0'
            };
            return React.createElement("div", { className: 'CurveEditor' },
                React.createElement("div", { style: css_round_box },
                    React.createElement("div", { style: { textAlign: 'center', borderBottom: '1px solid white', margin: '0' } }, "\u521B\u5EFA\u66F2\u7EBF"),
                    React.createElement(CreateCurveButton, { type: 'CatmullRomCurve3', name: '\u81EA\u52A8\u66F2\u7EBF' }),
                    React.createElement(CreateCurveButton, { type: 'QuadraticBezierCurve3', name: '\u4E8C\u6B21\u8D1D\u585E\u5C14\u66F2\u7EBF' }),
                    React.createElement(CreateCurveButton, { type: 'CubicBezierCurve3', name: '\u4E09\u6B21\u8D1D\u585E\u5C14\u66F2\u7EBF' }),
                    React.createElement(CreateCurveButton, { type: 'ArcCurve', name: '\u87BA\u65CB\u66F2\u7EBF' }),
                    React.createElement(CreateCurveButton, { type: 'TranslationGhostCurve', name: '\u591A\u91CD\u5206\u8EAB\u66F2\u7EBF' })),
                React.createElement(CurveCommonEditor, null),
                React.createElement("hr", null),
                React.createElement(ArcCurveEditor, null),
                React.createElement(CatmullRomCurve3Editor, null),
                React.createElement(TranslationGhostCurveEditor, null));
        }
    }
    function CurveCommonEditor() {
        var curve = app.selection.onlyOneSelectedCurve;
        function SelectAllButton() {
            var disabled = !app.selection.cmd_isAllowSelectAll();
            return React.createElement("button", { onClick: e => app.selection.cmd_selectAll(), disabled: disabled }, "\u9009\u4E2D\u6574\u6761\u66F2\u7EBF");
        }
        function RemoveCurveButton(props) {
            var disabled = !app.selection.cmd_isAllowRemoveCurve();
            function onClick() {
                app.selection.cmd_removeCurve();
            }
            var css = {
                color: disabled ? undefined : 'red'
            };
            return React.createElement("button", { style: css, onClick: onClick, disabled: disabled }, "\u5220\u9664\u5F53\u524D\u66F2\u7EBF");
        }
        var curves = app.selection.selectionCurves;
        var allVisible = curves.every(x => x.visible);
        var allHidden = curves.every(x => !x.visible);
        function onVisibleChange(e) {
            app.selection.selectionCurves.forEach(c => {
                c.visible = !!e.target.checked;
            });
        }
        return React.createElement("div", null,
            React.createElement("div", null,
                React.createElement(CurveList, null)),
            React.createElement("div", { style: { overflow: 'hidden', whiteSpace: 'nowrap' } },
                "\u66F2\u7EBF\u7C7B\u578B\uFF1A",
                curve ? curve.curve.curveType : ''),
            React.createElement("div", { title: '\u8D8A\u4F4E\u8D8A\u597D' },
                "\u66F2\u7EBF\u8BEF\u5DEE\uFF1A   ",
                curve ? ((Math.floor(curve.curve.getParameter('curveError') * 10000))) / 100 + '%' : ''),
            React.createElement("div", null,
                React.createElement(SelectAllButton, null),
                React.createElement(RemoveCurveButton, null)),
            React.createElement("div", null,
                "\u751F\u6210\u8D28\u91CF\uFF1A",
                ParameterBox('generateQuality', 1)),
            React.createElement("div", null,
                "\u66F2\u7EBF\u989C\u8272\uFF1A",
                React.createElement(CurveColorInput, null)),
            React.createElement("div", null,
                "\u663E\u793A\u66F2\u7EBF\uFF1A",
                React.createElement(IndeterminateCheckbox, { disabled: curves.length === 0, indeterminate: !allHidden && !allVisible, checked: allVisible, onChange: onVisibleChange })));
    }
    function CurveList() {
        var sel = app.selection.onlyOneSelectedCurve;
        var list = app.curves.map(curve => {
            return React.createElement("option", { key: curve.uuid, value: curve.uuid },
                curve.name,
                curve.visible ? '' : '(隐藏的)');
        });
        list.unshift(React.createElement("option", { key: '', value: '' }, "--"));
        function onChange(e) {
            if (!e.target.value) {
                app.selection.clear();
            }
            else {
                var cc = app.getCurveByUUID(e.target.value);
                if (cc) {
                    app.selection.clear();
                    app.selection.add(cc.controlPoints[0]);
                    app.selection.cmd_selectAll();
                }
            }
        }
        var css = { width: '60%' };
        return React.createElement(React.Fragment, null,
            "\u66F2\u7EBF\u5217\u8868\uFF1A",
            React.createElement("select", { style: css, onChange: onChange, value: sel ? sel.uuid : '' }, list));
    }
    function CurveColorInput() {
        var curves = app.selection.selectionCurves;
        var color;
        if (curves.length === 0) {
            color = '#000000';
        }
        else {
            color = curves[curves.length - 1].color;
        }
        function onChange(e) {
            var value = e.target.value;
            for (var c of app.selection.selectionCurves) {
                c.color = value;
            }
        }
        return React.createElement("input", { type: 'color', value: color, disabled: curves.length === 0, onChange: onChange });
    }
    function ArcCurveEditor(props) {
        var curve = app.selection.onlyOneSelectedCurve;
        if (!curve)
            return null;
        if (curve.curve.curveType !== 'ArcCurve')
            return null;
        function getOnChangeValueProc(key) {
            return function (val) {
                curve.setParameter(key, val);
            };
        }
        function getOnChangeDeltaProc(key) {
            return function (val) {
                curve.setParameter(key, curve.getParameter(key) + val);
            };
        }
        function getOnChangeStart(key) {
            return function () {
                app.recordCurveModify(curve);
            };
        }
        var css = { width: '50%' };
        var Box = key => React.createElement(NumberBox, { style: css, step: 1, value: curve.getParameter(key), onChangeValue: getOnChangeValueProc(key), onChangeDelta: getOnChangeDeltaProc(key), onChangeStart: getOnChangeStart(key) });
        return React.createElement("div", null,
            React.createElement("div", null,
                "\u534A\u5F84\u5927\u5C0F\uFF1A ",
                Box('radius')),
            React.createElement("div", null,
                "\u5F00\u59CB\u89D2\u5EA6\uFF1A ",
                Box('degreeStart')),
            React.createElement("div", null,
                "\u7ED3\u675F\u89D2\u5EA6\uFF1A ",
                Box('degreeEnd')),
            React.createElement("div", null,
                "\u989D\u5916\u7684\u70B9\uFF1A ",
                Box('extraPointCount')));
    }
    function CatmullRomCurve3Editor(props) {
        var curve = app.selection.onlyOneSelectedCurve;
        if (!curve)
            return null;
        if (curve.curve.curveType !== 'CatmullRomCurve3')
            return null;
        function getOnChangeValueProc(key) {
            return function (val) {
                curve.setParameter(key, val);
            };
        }
        function getOnChangeDeltaProc(key) {
            return function (val) {
                curve.setParameter(key, curve.getParameter(key) + val);
            };
        }
        function getOnChangeStart(key) {
            return function () {
                app.recordCurveModify(curve);
            };
        }
        var css = { width: '50%' };
        var Box = key => React.createElement(NumberBox, { style: css, step: 0.1, value: curve.getParameter(key), onChangeValue: getOnChangeValueProc(key), onChangeDelta: getOnChangeDeltaProc(key), onChangeStart: getOnChangeStart(key) });
        return React.createElement("div", null,
            React.createElement("div", null,
                "\u66F2\u7EBF\u5F20\u529B\uFF1A   ",
                Box('tension')));
    }
    function ParameterBox(key, step = 0.1) {
        var curve = app.selection.onlyOneSelectedCurve;
        function OnChangeValue(val) {
            if (curve)
                curve.setParameter(key, val);
        }
        function OnChangeDelta(val) {
            if (curve)
                curve.setParameter(key, curve.getParameter(key) + val);
        }
        function OnChangeStart() {
            if (curve)
                app.recordCurveModify(curve);
        }
        var css = { width: '50%' };
        var value = curve ? (curve.getParameter(key) || 0) : 0;
        return React.createElement(NumberBox, { disabled: !curve, style: css, step: step, value: value, onChangeValue: OnChangeValue, onChangeDelta: OnChangeDelta, onChangeStart: OnChangeStart });
    }
    //# sourceMappingURL=CurveEditor.js.map

    class AnimationEditor extends React.Component {
        constructor(props) {
            super(props);
            this.state = {};
        }
        render() {
            var self = this;
            var playbutton;
            var control = app.animationPreviewControl;
            if (control.isPlaying) {
                playbutton = React.createElement("button", { onClick: e => { control.stop(); this.setState({}); } }, "\u505C\u6B62");
            }
            else {
                playbutton = React.createElement("button", { onClick: e => { control.play(); this.setState({}); } }, "\u64AD\u653E");
            }
            function onTimeScaleChange(e) {
                control.timeScale = e.target.value;
                self.setState({});
            }
            return React.createElement(React.Fragment, null,
                React.createElement("div", null, playbutton),
                React.createElement("div", null,
                    "\u64AD\u653E\u901F\u5EA6\uFF1A",
                    React.createElement("input", { style: { width: '100px', verticalAlign: 'middle' }, type: 'range', min: 0, max: 5, step: 0.1, value: control.timeScale, onChange: onTimeScaleChange }),
                    control.timeScale));
        }
    }
    //# sourceMappingURL=AnimationEditor.js.map

    class Panel extends React.Component {
        constructor(props) {
            super(props);
            this.state = { show: true };
        }
        onClick(e) {
            this.setState((ps) => { return { show: !ps.show }; });
        }
        render() {
            const up = '▲';
            const down = '▼';
            return React.createElement("div", { className: 'panel' },
                React.createElement("div", { className: 'title', onMouseDown: e => this.onClick(e) },
                    this.props.title || '',
                    this.state.show ? down : up),
                React.createElement("div", { className: ['content', this.state.show ? "show" : "hide"].join(' ') }, this.props.children));
        }
    }
    //# sourceMappingURL=Panel.js.map

    //import { NumberBox } from './controls/NumberBox'
    class UIApplication extends React.Component {
        constructor(props) {
            super(props);
            this.state = { value: 0 };
        }
        //call this when selection changed
        //or control point data changed
        refreshSelectionControlPoints() {
            //this.forceUpdate();
            this.setState({});
        }
        render() {
            return React.createElement(React.Fragment, null,
                React.createElement(Panel, { title: 'point editor' },
                    React.createElement(ControlPointEditor, null)),
                React.createElement(Panel, { title: 'curve editor' },
                    React.createElement(CurveEditor, null)),
                React.createElement(Panel, { title: '\u52A8\u753B' },
                    React.createElement(AnimationEditor, null)));
        }
    }
    var appRef = React.createRef();
    function init() {
        var uilayer = document.createElement('div');
        uilayer.id = 'uilayer';
        ReactDOM.render(React.createElement(UIApplication, { ref: appRef }), uilayer);
        document.body.appendChild(uilayer);
    }
    function getUIApp() {
        return appRef.current;
    }
    //# sourceMappingURL=UIApplication.js.map

    //# sourceMappingURL=index.js.map

    const DEFAULT_CURVE = {
        curves: [
            {
                type: 'CatmullRomCurve3',
                points: [
                    { x: 400, y: -120, z: 100 },
                    { x: 200, y: -120, z: 100 },
                    { x: 0, y: 120, z: 100 },
                    { x: -200, y: -120, z: 100 },
                    { x: -400, y: -120, z: 100 },
                ]
            },
            {
                type: 'ArcCurve',
            },
            {
                type: 'CubicBezierCurve3',
                points: [
                    { x: -400, y: 120, z: 300 },
                    { x: -400, y: -120, z: 300 },
                    { x: 0, y: -120, z: 300 },
                    { x: 0, y: 0, z: 300 },
                    { x: 0, y: 120, z: 300 },
                    { x: 400, y: 120, z: 300 },
                    { x: 400, y: -120, z: 300 }
                ]
            },
            {
                type: 'QuadraticBezierCurve3',
                points: [
                    { x: -400, y: -120, z: 0 },
                    { x: -200, y: 120, z: 0 },
                    { x: 0, y: 120, z: 0 },
                    { x: 200, y: 120, z: 0 },
                    { x: 400, y: -120, z: 0 },
                ]
            },
        ]
    };
    DEFAULT_CURVE.curves.length = 1;
    const CAMERA_POS = new THREE.Vector3(0, 0, -624);
    const CAMERA_ROTATION = new THREE.Quaternion();
    const CAMERA_TARGET = new THREE.Vector3(0, 0, 0);
    THREE.Object3D.prototype['lookAt'].call({ position: CAMERA_POS, quaternion: CAMERA_ROTATION, up: new THREE.Vector3(0, 1, 0), isCamera: true }, 0, 0, 0);
    class Application {
        constructor() {
            this.scene = new THREE.Scene();
            this.camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
            this.renderer = new THREE.WebGLRenderer();
            this.curves = [];
            this.controlPoints = [];
            this.controlPointObjects = [];
            //rootGui: dat.GUI = new dat.GUI();
            this.clock = new THREE.Clock(true);
            this._deltaTime = 0;
            this._records = [];
            this._isCameraMoving = false;
            this._cameraMovingTime = 0;
            this._cameraMovingEndTime = 0.3;
            this._cameraTargetPosition = CAMERA_POS;
            this._cameraTargetRotation = CAMERA_ROTATION;
            this._cameraStartPosition = CAMERA_POS;
            this._cameraStartRotation = CAMERA_ROTATION;
            document.body.appendChild(this.renderer.domElement);
            window.addEventListener('keydown', e => {
                if (e.key === 'z' && e.ctrlKey) {
                    this.restoreRecord();
                }
            });
            this.domElement.addEventListener('mousedown', e => {
                if (document.activeElement && document.activeElement['blur'])
                    document.activeElement['blur']();
            });
            this.initCommonUI();
            this.initScene();
            this.pickOfControlPoints = new ObjectPickControl(this);
            this.pickOfControlPoints.objects = this.controlPointObjects;
            this.initSelection();
            this.initOrbitControl();
            this.initGameCameraFrame();
            window.addEventListener('resize', () => this.onResize());
            document.addEventListener('unload', e => { this.renderer.dispose(); });
            setTimeout(() => this.onResize(), 1);
            window['app'] = this;
            this.animationPreviewControl = new AnimationPreviewControl();
            //var curve = this.addCurveObject();
            if (window.location.search !== '?reset' && localStorage.getItem('default_slot')) {
                var data = JSON.parse(localStorage.getItem('default_slot'));
                this.fromJSON(data);
            }
            else {
                this.fromJSON(DEFAULT_CURVE);
            }
            this.renderer.setClearColor(new THREE.Color(0, 0, 0), 1);
            this.animate();
            init();
        }
        get domElement() { return this.renderer.domElement; }
        get deltaTime() { return this._deltaTime; }
        initCommonUI() {
            //var ui = this.rootGui.addFolder('common');
            //ui.add(this, 'resetCamera').name('Reset camera');
        }
        initScene() {
            this.scene.background = new THREE.Color(0);
            this.scene.add(new THREE.AmbientLight(0xf0f0f0));
            var directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
            this.scene.add(directionalLight);
            var helper = new THREE.GridHelper(600 * 2, 100);
            helper.position.y = -200;
            helper.material.opacity = 0.25;
            helper.material.transparent = true;
            this.scene.add(helper);
            helper.visible = false;
            this.camera.position.copy(CAMERA_POS);
            this.camera.quaternion.copy(CAMERA_ROTATION);
            if (this.camera instanceof THREE.PerspectiveCamera) {
                this.camera.fov = 60;
                this.camera.near = 9.9;
                this.camera.far = 2800 * 3;
                this.camera.updateProjectionMatrix();
            }
            this.camera.updateMatrix();
        }
        initOrbitControl() {
            var control = new THREE.OrbitControls(this.camera, this.renderer.domElement);
            this.cameraOrbitControl = control;
        }
        initSelection() {
            this.selection = new ControlPointSelection(this);
            this.pickOfControlPoints.addEventListener('mousedown', e => {
                var obj = e.object;
                if (obj)
                    obj = obj['controlPoint'];
                var me = e.originalEvent;
                if (!obj) {
                }
                else {
                    if (me.shiftKey) {
                        this.selection.add(obj);
                    }
                    else if (me.ctrlKey) {
                        this.selection.toggle(obj);
                    }
                    else {
                        //如果obj是selections中最后一个的话，可能是的点在了 drag gizmos上。
                        //那样，如果执行了下面的代码的话，就会清空选择了。
                        if (obj !== this.selection.selections[this.selection.selections.length - 1]) {
                            this.selection.clear();
                            this.selection.add(obj);
                            this.selection.tryTriggerDrag(me);
                        }
                    }
                }
            });
        }
        onResize() {
            var canvas = this.renderer.domElement;
            this.renderer.setSize(window.innerWidth, window.innerHeight, true);
            if (this.camera instanceof THREE.PerspectiveCamera) {
                this.camera.aspect = window.innerWidth / window.innerHeight;
                this.camera.updateProjectionMatrix();
            }
            this.render();
        }
        addControlPoint(c) {
            this.controlPoints.push(c);
            this.controlPointObjects.push(c.mesh);
        }
        removeControlPoint(c) {
            var pos = this.controlPoints.indexOf(c);
            if (pos >= 0) {
                this.controlPoints.splice(pos, 1);
                this.controlPointObjects.splice(pos, 1);
            }
            else {
                console.warn('removeControlPoint error.', c);
            }
        }
        animate() {
            this._deltaTime = this.clock.getDelta();
            this.updateCameraMoving();
            this.animationPreviewControl.update();
            this.selection.update();
            for (var c of this.curves) {
                c.update();
            }
            this.render();
            requestAnimationFrame(() => this.animate());
        }
        render() {
            this.renderer.render(this.scene, this.camera, undefined, true);
        }
        recordAllCurves() {
            this.recordCurveModify(this.curves);
        }
        recordCurveModify(curves) {
            if (!Array.isArray(curves)) {
                curves = [curves];
            }
            var record = [];
            for (var cc of curves) {
                if (this.curves.indexOf(cc) >= 0) {
                    record.push({
                        type: 'modify',
                        curve: cc,
                        data: cc.toJSON()
                    });
                }
            }
            this._records.push(record);
            return record;
        }
        recordAddCurve(curve) {
            this._records.push([
                { type: 'add', curve: curve }
            ]);
        }
        recordRemoveCurve(curve) {
            this._records.push([
                { type: 'remove', curve: null, data: curve.toJSON() }
            ]);
        }
        restoreRecord() {
            var record = this._records.pop();
            if (record) {
                for (var item of record) {
                    if (item.type === 'modify') {
                        if (this.curves.indexOf(item.curve) >= 0) {
                            item.curve.fromJSON(item.data);
                        }
                    }
                    else if (item.type === 'add') {
                        this.removeCurve(item.curve);
                    }
                    else if (item.type === 'remove') {
                        let curve = new CurveObject(item.data);
                        this.addCurve(curve);
                    }
                }
                this.selection.refreshSelection();
                this.getUI().forceUpdate();
            }
        }
        removeRecord() {
            this._records.pop();
        }
        //add an alread constructed CurveObject
        addCurve(curve) {
            curve.attachTo(app);
            this.curves.push(curve);
            curve.addEventListener('change', e => this.onCurveChange(e));
            this.getUI().refreshSelectionControlPoints();
        }
        startCameraMoving() {
            this._cameraStartPosition = this.camera.position.clone();
            this._cameraStartRotation = this.camera.quaternion.clone();
            this.cameraOrbitControl.enabled = false;
            this._cameraMovingTime = 0;
            this._cameraMovingEndTime = 0.2;
            this._isCameraMoving = true;
        }
        endCameraMoving() {
            this.cameraOrbitControl.dispose();
            this.cameraOrbitControl = new THREE.OrbitControls(this.camera, this.domElement);
            this._isCameraMoving = false;
        }
        updateCameraMoving() {
            if (this._isCameraMoving) {
                this._cameraMovingTime += this.deltaTime;
                var t = this._cameraMovingTime / this._cameraMovingEndTime;
                if (t > 1)
                    t = 1;
                this.camera.position.lerpVectors(this._cameraStartPosition, this._cameraTargetPosition, t);
                this.camera.quaternion.copy(this._cameraStartRotation).slerp(this._cameraTargetRotation, t);
                this.camera.updateMatrix();
                if (t >= 1) {
                    this.endCameraMoving();
                }
            }
        }
        toJSON() {
            var curves = [];
            for (var c of this.curves) {
                curves.push(c.toJSON());
            }
            return { curves };
        }
        fromJSON(obj) {
            if (obj && obj.curves && Array.isArray(obj.curves)) {
                while (this.curves.length > obj.curves.length) {
                    var c = this.curves.pop();
                    c.dispose();
                }
                for (var i = 0; i < obj.curves.length; ++i) {
                    var curveObj = obj.curves[i];
                    if (this.curves[i]) {
                        if (this.curves[i].curve.curveType === curveObj.type) {
                            this.curves[i].fromJSON(curveObj);
                        }
                        else {
                            this.curves[i].dispose();
                            this.curves[i] = new CurveObject(curveObj);
                            this.curves[i].attachTo(this);
                            this.curves[i].addEventListener('change', e => this.onCurveChange(e));
                        }
                    }
                    else {
                        this.curves[i] = new CurveObject(curveObj);
                        this.curves[i].attachTo(this);
                        this.curves[i].addEventListener('change', e => this.onCurveChange(e));
                    }
                }
            }
        }
        addNewCurve(type) {
            var curve = new CurveObject({ type: type });
            this.addCurve(curve);
            return curve;
        }
        removeCurve(curve) {
            var idx = this.curves.indexOf(curve);
            if (idx >= 0) {
                curve.dispose();
                this.curves.splice(idx, 1);
                this.selection.refreshSelection();
                this.getUI().refreshSelectionControlPoints();
            }
        }
        onCurveChange(e) {
            localStorage.setItem('default_slot', JSON.stringify(this.toJSON()));
        }
        resetCamera() {
            this.startCameraMoving();
        }
        initGameCameraFrame() {
            var near = 9.9;
            var far = 2800;
            var fov = 60 - 0.5;
            var aspect = 16 / 8;
            const Vector3 = THREE.Vector3;
            var pos = CAMERA_POS;
            var up = new Vector3(0, 1, 0);
            var dir = new Vector3();
            dir.subVectors(CAMERA_TARGET, CAMERA_POS).normalize();
            var right = up.clone().cross(dir);
            function gen(center, w, h) {
                var ww = right.clone().multiplyScalar(w);
                var hh = up.clone().multiplyScalar(h);
                var n1 = center.clone().sub(ww).sub(hh);
                var n2 = center.clone().sub(ww).add(hh);
                var n3 = center.clone().add(ww).add(hh);
                var n4 = center.clone().add(ww).sub(hh);
                return [n1, n2, n3, n4];
            }
            var nh = near * Math.tan(fov * 0.5 * Math.PI / 180);
            var nw = aspect * nh;
            var nearCenter = dir.clone().multiplyScalar(near).add(pos);
            var fh = far * Math.tan(fov * 0.5 * Math.PI / 180);
            var fw = aspect * fh;
            var farCenter = dir.clone().multiplyScalar(far).add(pos);
            var nn = gen(nearCenter, nw, nh);
            var ff = gen(farCenter, fw, fh);
            var geom = new THREE.Geometry();
            geom.vertices.push(nn[0], nn[1], nn[1], nn[2], nn[2], nn[3], nn[3], nn[0], ff[0], ff[1], ff[1], ff[2], ff[2], ff[3], ff[3], ff[0], nn[0], ff[0], nn[1], ff[1], nn[2], ff[2], nn[3], ff[3]);
            var mat = new THREE.LineBasicMaterial({ color: 0xff0000 });
            this.scene.add(new THREE.LineSegments(geom, mat));
            var geom2 = new THREE.BufferGeometry();
            geom2.addAttribute('position', new THREE.BufferAttribute(new Float32Array([
                ff[0].x, ff[0].y, ff[0].z,
                ff[1].x, ff[1].y, ff[1].z,
                ff[2].x, ff[2].y, ff[2].z,
                ff[3].x, ff[3].y, ff[3].z,
            ]), 3));
            geom2.addAttribute('uv', new THREE.BufferAttribute(new Float32Array([
                0, 0,
                0, 1,
                1, 1,
                1, 0
            ]), 2));
            geom2.setIndex([0, 1, 2, 0, 2, 3]);
            var texture = new THREE.TextureLoader().load('res/bg.jpg');
            var mat2 = new THREE.MeshBasicMaterial({ color: 0xffff00, map: texture, polygonOffset: true, polygonOffsetFactor: 1, polygonOffsetUnits: 1 });
            this.scene.add(new THREE.Mesh(geom2, mat2));
        }
        getUI() {
            return getUIApp();
        }
        getCurveByUUID(id) {
            for (var c of this.curves) {
                if (c.uuid === id)
                    return c;
            }
            return null;
        }
    }
    //# sourceMappingURL=Application.js.map

    ///<reference path="types.d.ts"/>
    window.onerror = function (e) {
        alert('Error:\n' + e.toString() + '\n' + e['stack']);
    };
    function main() {
        var app = new Application();
    }
    //# sourceMappingURL=main.js.map

    exports.main = main;

    return exports;

}({}));
//# sourceMappingURL=app.js.map
