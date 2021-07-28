import React from "react";
import { places } from "../../utils/places";

export default function Places() {
  return (
    <div>
      List View for Places
      <div>{Object.keys(places)}</div>
    </div>
  );
}
