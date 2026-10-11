import { Box3, Mesh, Object3D, Vector3 } from "three";
// Frame the main structure without editing or hiding detached source objects.
export function structureBounds(root: Object3D): Box3 {
  root.updateWorldMatrix(true, true);
  const boxes: Box3[] = [];
  root.traverse((object) => {
    if (object instanceof Mesh) {
      const box = new Box3().setFromObject(object);
      if (!box.isEmpty()) boxes.push(box);
    }
  });
  if (!boxes.length) return new Box3().setFromObject(root);
  const volume = (box: Box3) => {
    const size = box.getSize(new Vector3());
    return size.x * size.y * size.z;
  };
  const anchor = boxes.reduce((largest, box) =>
    volume(box) > volume(largest) ? box : largest,
  );
  const center = anchor.getCenter(new Vector3()),
    radius = anchor.getSize(new Vector3()).length() * 1.5;
  const result = new Box3();
  for (const box of boxes)
    if (box.getCenter(new Vector3()).distanceTo(center) <= radius)
      result.union(box);
  return result;
}
