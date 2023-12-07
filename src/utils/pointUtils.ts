import { MathUtils, Vector3 } from 'three';

export type LatLngTypes =
    | google.maps.LatLngLiteral
    | google.maps.LatLng
    | google.maps.LatLngAltitudeLiteral
    | google.maps.LatLngAltitude;

const { cos, log, tan, PI } = Math;
const { degToRad } = MathUtils;

export const EARTH_RADIUS = 6371010.0;

export function toLatLngAltitudeLiteral(point: LatLngTypes): google.maps.LatLngAltitudeLiteral {
    if (
        typeof point === 'object' &&
        point !== null &&
        (point instanceof google.maps.LatLng || point instanceof google.maps.LatLngAltitude)
    )
        return { altitude: 0, ...point.toJSON() };

    return { altitude: 0, ...point };
}

export function latLngToVector3Relative(
    point: google.maps.LatLngAltitudeLiteral,
    reference: google.maps.LatLngAltitudeLiteral,
    target = new Vector3(),
) {
    const [px, py] = latLngToXY(point);
    const [rx, ry] = latLngToXY(reference);
    target.set(px - rx, py - ry, 0);
    target.multiplyScalar(cos(degToRad(reference.lat)));
    target.z = point.altitude - reference.altitude;
    return target;
}

export function latLngToXY(position: google.maps.LatLngLiteral): number[] {
    return [EARTH_RADIUS * degToRad(position.lng), EARTH_RADIUS * log(tan(0.25 * PI + 0.5 * degToRad(position.lat)))];
}

