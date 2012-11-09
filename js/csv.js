/**
 * Created by renbing
 * User: renbing
 * Date: 12-11-02
 * Time: 下午2:47
 *
 */

/**
 * CSV配置文件管理
 */

function CSVRowToObject(column, columnType, cols) {
    var obj = {};
    for( var j=0,max=column.length; j<max; j++ ) {
        var value = cols[j];
        if( columnType[j] == "int" ) {
            value = +value;
        }else if( columnType[j] == "boolean" ) {
            value = (value.toLowerCase() == "true");
        }
        obj[column[j]] = value;
    }

    return obj;
}

function BuildingCSV(rawData) {
    this.data = {};
    this.column = [];
    this.columnType = [];

    var rows = rawData.split("\n");
    var id = null;
    var level = null;

    for( var i=0; i<rows.length; i++ ) {
        var cols = rows[i].split(",");
        if( i == 0 ) {
            for(var j=0; j<cols.length; j++ ) {
                this.column.push(cols[j].trim());
            }
            continue;
        }else if( i == 1 ) {
            continue;
        }else if( i == 2 ) {
            for(var j=0; j<cols.length; j++ ) {
                this.columnType.push(cols[j].trim().toLowerCase());
            }
            continue;
        }
        if( cols.length != this.column.length ) continue;
        
        var newId = cols[0].trim();
        if( newId != "" && id != newId ) {
            id = newId;
            this.data[id] = {};
        }
        this.data[id][cols[3]] = cols;
    }
}

BuildingCSV.prototype.get = function(id, level) {
    if( !(id in this.data) || !(level in this.data[id]) ) return null;

    return CSVRowToObject(this.column, this.columnType, this.data[id][level]);
};

function LevelCSV(rawData) {
    this.levelXp = {};
    this.data = [];
    this.columnType = [];

    var rows = rawData.split("\n");
    for( var i=1; i<rows.length; i++ ) {
        var cols = rows[i].split(",");
        if( cols.length != 2 ) continue;

        cols[0] = +cols[0];
        cols[1] = +cols[1];
        this.levelXp[cols[0]] = cols[1]; 
        this.data.push(cols);
    }
}

LevelCSV.prototype.getXp = function(level) {
    return this.levelXp[level];
};

LevelCSV.prototype.getLevel = function(xp) {
    for( var i=0; i<this.data.length; i++ ) {
        var cols = this.data[i];
        if( xp < cols[1] ) {
            return cols[0];
        }
    }
};

function TownHallLevelCSV(rawData) {
    this.data = {};

    var rows = rawData.split("\n");
    var column = [];
    var columnType = [];
    
    var prevCols = null;
    for( var i=0; i<rows.length; i++ ) {
        var cols = rows[i].split(",");
        if( i == 0 ) {
            for(var j=0; j<cols.length; j++ ) {
                column.push(cols[j].trim());
            }
            continue;
        }else if( i == 1 ) {
            for(var j=0; j<cols.length; j++ ) {
                columnType.push(cols[j].trim().toLowerCase());
            }
            continue;
        }
        if( cols.length != column.length ) continue;
        
        var obj = CSVRowToObject(column, columnType, cols);

        this.data[obj.Level] = obj;
        prevCols = cols;
    }
}

TownHallLevelCSV.prototype.get = function(level) {
    return this.data[level];
};

function CommonCSV(rawData) {
    this.data = {};

    var rows = rawData.split("\n");
    var column = [];
    var columnType = [];

    for( var i=0; i<rows.length; i++ ) {
        var cols = rows[i].split(",");
        if( i == 0 ) {
            for(var j=0; j<cols.length; j++ ) {
                column.push(cols[j].trim());
            }
            continue;
        }else if( i == 1 ) {
            for(var j=0; j<cols.length; j++ ) {
                columnType.push(cols[j].trim().toLowerCase());
            }
            continue;
        }
        if( cols.length != column.length ) continue;

        var obj = CSVRowToObject(column, columnType, cols);
        this.data[obj.ID] = obj;
    }
}

CommonCSV.prototype.get = function(id) {
    return this.data[id];
}

function GlobalCSV(rawData) {

    var rows = rawData.split("\n");
    for( var i=1; i<rows.length; i++ ) {
        var cols = rows[i].split(",");
        if( cols.length != 2 ) {
            continue;
        }
        var key = cols[0];
        var value = cols[1];

        if( !isNaN(value) ) {
            value = +value;
        }
        this[key] = value;
    }
}

function CharacterCSV(rawData) {
    this.data = {};
    this.column = [];
    this.columnType = [];

    var rows = rawData.split("\n");
    var id = null;
    var level = 1;

    for( var i=0; i<rows.length; i++ ) {
        var cols = rows[i].split(",");
        if( i == 0 ) {
            for(var j=0; j<cols.length; j++ ) {
                this.column.push(cols[j].trim());
            }
            continue;
        }else if( i == 1 ) {
            for(var j=0; j<cols.length; j++ ) {
                this.columnType.push(cols[j].trim().toLowerCase());
            }
            continue;
        }
        if( cols.length != this.column.length ) continue;

        var newId = cols[0].trim();
        if( newId != "" && id != newId ) {
            id = newId;
            level = 1;
            this.data[id] = {};
        }
        this.data[id][level] = cols;
        level += 1;
    }
}

CharacterCSV.prototype.get = function(id, level) {
    if( !(id in this.data) || !(level in this.data[id]) ) return null;

    return CSVRowToObject(this.column, this.columnType, this.data[id][level]);
};

CharacterCSV.prototype.getByBuilding = function(buildingId) {
    var result = [];
    
    for( var id in this.data ) {
        if( this.data[id][1][2] == buildingId ) {
            result.push(CSVRowToObject(this.column, this.columnType, this.data[id][1]));
        }
    }

    return result;
};
