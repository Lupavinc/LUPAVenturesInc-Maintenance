import client from "./contentful";

export async function fetchProperties() {
  const entries = await client.getEntries({ content_type: "property" });

  return entries.items.map((item) => {
    const {
      title,
      price,
      availability,
      generallocation, 
      coverImage,
      description,
      address,
      rentalTerms,
      bedroomsNum,
      bathroomsnumber,
      size,
      amenities,
      landmarks,
    } = item.fields;

    return {
      id: item.sys.id,
      title: title || "No title available", 
      price: price || "No price listed", 
      availability: availability || "No availability date", 
      Generallocation: generallocation || "Location not available", 
      coverImage: coverImage?.fields?.file?.url || "", 
      description: description || "No description available", 
      address: address || "No address available", 
      rentalTerms: rentalTerms || "No rental terms provided", 
      bedroomsNum: bedroomsNum || "Not specified", 
      bathroomsnumber: bathroomsnumber || "Not specified", 
      size: size || "Size not specified", 
      amenities: amenities || "No amenities listed", 
      landmarks: landmarks || "No landmarks provided", 
    };
  });
}
