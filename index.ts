import "dotenv/config";

const arrayGroupDomain = process.env.CF_GROUP_DOMAIN?.trim().split(",");

const UpdateCloudflare = () => {
    arrayGroupDomain?.forEach(async (domainName) => {
        const existingRecord = await fetch(
            `https://api.cloudflare.com/client/v4/zones/${process.env.ZONE_ID}/dns_records?type=A&name=${domainName}`,
            {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${process.env.API_TOKEN}`,
                },
            }
        );

        const existingRecordData = await existingRecord.json();
        if (existingRecordData.result.length !== 0) {
            const url = `https://api.cloudflare.com/client/v4/zones/${process.env.ZONE_ID}/dns_records/${existingRecordData.result[0].id}`;
            const response = await fetch(url, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${process.env.API_TOKEN}`,
                },
                body: JSON.stringify({
                    type: "A",
                    name: domainName,
                    content: await fetch("https://api.ipify.org?format=json")
                        .then((res) => res.json())
                        .then((data) => data.ip),
                    ttl: 1,
                    proxied: true,
                }),
            });

            const data = await response.json();
            console.log(data.success ? "Updated" : "Failed");
        } else {
            const response = await fetch(
                `https://api.cloudflare.com/client/v4/zones/${process.env.ZONE_ID}/dns_records`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${process.env.API_TOKEN}`,
                    },
                    body: JSON.stringify({
                        type: "A",
                        name: domainName,
                        content: await fetch(
                            "https://api.ipify.org?format=json"
                        )
                            .then((res) => res.json())
                            .then((data) => data.ip),
                        ttl: 1,
                        proxied: true,
                    }),
                }
            );

            const data = await response.json();
            console.log(data.success ? "Updated" : "Failed");
        }
    });
};

UpdateCloudflare();

setInterval(() => {
    UpdateCloudflare();
}, 300 * 1000);
