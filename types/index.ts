import { AnimationClip, Object3D, type RaycasterParameters } from 'three';

export type RaycastOptions = {
    recursive?: boolean;
    updateMatrix?: boolean;
    raycasterParameters?: RaycasterParameters;
};

export type GLTFObject = {
    Model: Object3D;
    Animations: AnimationClip[];
};
