import { BloomingDivaExperience } from "@/components/blooming-diva-experience";
import { getImagesFromPublicFolder } from "@/lib/media";
import { siteContent } from "@/lib/site-content";

export default function Home() {
  const marqueeImages = getImagesFromPublicFolder("media/marquee");
  const topicImages = {
    style: getImagesFromPublicFolder("media/style"),
    photo: getImagesFromPublicFolder("media/photo"),
    makeup: getImagesFromPublicFolder("media/makeup"),
  };

  return (
    <BloomingDivaExperience
      content={siteContent}
      marqueeImages={marqueeImages}
      topicImages={topicImages}
    />
  );
}
