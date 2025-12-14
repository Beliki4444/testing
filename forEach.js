const posts = [
    {
        id: 1,
        text: 'Post 1',
    },
    {
        id: 2,
        text: 'Post 2',
    },
    {
        id: 3,
        text: 'Post 3',
    },
    {
        id: 4,
        text: 'Post 4',
    }
]

let accum = 0

posts.forEach((post) => {
    accum = accum + post.id;
})

const postLength = posts.length

const average = accum / postLength

console.log('Среднее арифметическое ', average)