const got = require('got')

class Pokemon {
    species_id = ""
    pokedex_id = ""
    pokedex_number = ""
}

async function scrapePokedex(url, pokedex_id) {
    try {
        const pokedex = []
        try {
            const response = await got(`${url}`).json()
            const wiki = response.parse.wikitext['*']

            wiki.match(/\d{3}\|\d{3}/g).forEach(pokedexEntry => {
                const entry = pokedexEntry.split('|')
                
                const pokemon = new Pokemon
                pokemon.species_id = parseInt(entry[1])
                pokemon.pokedex_id = pokedex_id
                pokemon.pokedex_number = parseInt(entry[0])

                pokedex.push(pokemon)
            })
        } catch (error) {
            console.log(error)
        }

        const uniquePokedex = []
        pokedex.map(entry => {
            uniquePokedex.filter(unique => {
                return unique.species_id == entry.species_id &&
                       unique.pokedex_id == entry.pokedex_id &&
                       unique.pokedex_number == entry.pokedex_number
            }).length > 0 ? null : uniquePokedex.push(entry)
        });

        return uniquePokedex
    } catch (error) {
        throw error
    }
}

function sortPokemon(a, b) {
    if (a.species_id == b.species_id) {
        return a.pokedex_id - b.pokedex_id
    }

    return a.species_id - b.species_id;
}

(async () => {
    try {
        const galar_pokedex = await scrapePokedex(`https://bulbapedia.bulbagarden.net/w/api.php?action=parse&page=List+of+Pok%C3%A9mon+by+Galar+Pok%C3%A9dex+number&prop=wikitext&format=json`, 26)
        const isle_or_armor_pokedex = await scrapePokedex(`https://bulbapedia.bulbagarden.net/w/api.php?action=parse&page=List+of+Pok%C3%A9mon+by+Isle+of+Armor+Pok%C3%A9dex+number&prop=wikitext&format=json`, 27)
        const crown_tundra_pokedex = await scrapePokedex(`https://bulbapedia.bulbagarden.net/w/api.php?action=parse&page=List+of+Pok%C3%A9mon+by+Crown+Tundra+Pok%C3%A9dex+number&prop=wikitext&format=json`, 28)
        galar_pokedex.concat(isle_or_armor_pokedex)
                     .concat(crown_tundra_pokedex)
                     .sort(sortPokemon)
                     .forEach(pokemon => {
            console.log(`${pokemon.species_id},${pokemon.pokedex_id},${pokemon.pokedex_number}`)
        })
    } catch (error) {
        console.log(error)
    }
})()
