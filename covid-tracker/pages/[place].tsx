import React, { FC } from "react";
import { useRouter } from "next/router";
import { places } from "../utils/places";

const slugsToPlaces: { [key: string]: string } = Object.entries(places).reduce(
  (obj, [place, { slugs }]) => {
    const placeSlugsToPlace = slugs.reduce(
      (_obj, slug) => ({ ..._obj, [`${slug}`]: place }),
      obj
    );
    return placeSlugsToPlace;
  },
  {}
);

interface PlaceProps {
  place: string;
}

export default function Place({ place }: PlaceProps) {
  return <div>{slugsToPlaces[place]}</div>;
}

interface Request {
  params: {
    place: string;
  };
}
export async function getStaticProps({ params }: Request) {
  const { place } = params;
  return {
    props: { place },
  };
}

export async function getStaticPaths() {
  const paths = Object.keys(slugsToPlaces).map((slug) => ({
    params: { place: slug.toLowerCase() },
  }));
  return { paths, fallback: false };
}
