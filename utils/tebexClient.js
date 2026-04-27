const token = process.env.NEXT_PUBLIC_TEBEX_TOKEN;

export const tebexClient = async (query) => {
    return await fetch(`https://headless.tebex.io/api/accounts/${token}/${query}`, {
        method: 'GET',
        headers: {},
    })
    .then(res => res.json())
    .catch(err => console.log(err));
}
