import { Matrix4, PerspectiveCamera, Scene, Vector3, Vector4 } from 'three';

let _camera: PerspectiveCamera | null;

let _vCamera: PerspectiveCamera;
const _vCamMvpMatrix = new Matrix4();
const _vCamInverseMvpMatrix = new Matrix4();
const _v4 = new Vector4();
const _m4 = new Matrix4();

export function useThreeCameras() {
    function initCameras() {
        _camera = new PerspectiveCamera();
        _vCamera = new PerspectiveCamera();

        return { camera: _camera, vCamera: _vCamera };
    }

    function getCamera() {
        return _camera;
    }

    function getVirtualCamera() {
        return _vCamera;
    }

    function updateVCam(scene: Scene, camera: PerspectiveCamera) {
        _vCamMvpMatrix.copy(camera.projectionMatrix);
        _vCamInverseMvpMatrix.copy(_vCamMvpMatrix).invert();

        _v4.set(0, 0, 1, 0);
        _v4.applyMatrix4(_vCamInverseMvpMatrix);
        _v4.multiplyScalar(1 / _v4.w);
        const cameraPosition = new Vector3();
        cameraPosition.set(_v4.x / _v4.w, _v4.y / _v4.w, _v4.z / _v4.w);

        const c = new Vector3(0, 0, 0).applyMatrix4(_vCamInverseMvpMatrix);
        const x = new Vector3(1, 0, 0).applyMatrix4(_vCamInverseMvpMatrix).sub(c).normalize();
        const y = new Vector3(0, 1, 0).applyMatrix4(_vCamInverseMvpMatrix).sub(c).normalize();
        const z = new Vector3(0, 0, -1).applyMatrix4(_vCamInverseMvpMatrix).sub(c).normalize();

        const near = new Vector3(0, 0, -1).applyMatrix4(_vCamInverseMvpMatrix).sub(cameraPosition).length();
        const far = new Vector3(0, 0, 1).applyMatrix4(_vCamInverseMvpMatrix).sub(cameraPosition).length();

        _m4.makeBasis(x, y, z);

        _vCamera.position.copy(cameraPosition);
        _vCamera.quaternion.setFromRotationMatrix(_m4);
        _vCamera.updateMatrixWorld();

        _vCamera.matrixWorldInverse.copy(_vCamera.matrixWorld).invert();

        const projectionMatrix = new Matrix4().multiplyMatrices(_vCamMvpMatrix, _vCamera.matrixWorldInverse);

        const fov = (2 * Math.atan(1 / projectionMatrix.elements[5]) * 180) / Math.PI;
        const aspectRatio = projectionMatrix.elements[5] / projectionMatrix.elements[0];

        _vCamera.fov = fov;
        _vCamera.aspect = aspectRatio;
        _vCamera.near = near;
        _vCamera.far = far;

        _vCamera.updateProjectionMatrix();

        scene.children.forEach(o => {
            const nameTag = o.children.find(node => node.name === 'nameTag');
            nameTag && nameTag.lookAt(_vCamera.position);
        });
    }

    return {
        initCameras,
        getCamera,
        getVirtualCamera,
        updateVCam,
    };
}
