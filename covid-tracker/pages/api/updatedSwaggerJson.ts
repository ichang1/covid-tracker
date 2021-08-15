import { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "GET") {
    const { data: backendSwaggerJson }: { [key: string]: any } =
      await axios.get(`${process.env.NEXT_PUBLIC_DATA_SOURCE_URL}/json`);
    // replace paths
    const { paths } = backendSwaggerJson;
    const updatedPaths = Object.entries(paths).reduce(
      (cur, [path, pathSchema]) => ({ ...cur, [`/api${path}`]: pathSchema }),
      {}
    );
    const updatedJson = { ...backendSwaggerJson, paths: updatedPaths };
    // delete updatedJson["schemes"];
    res.send(updatedJson);
  } else {
    res
      .status(405)
      .json({ message: `${req.method} is not allowed on ${req.url}` });
  }
}
