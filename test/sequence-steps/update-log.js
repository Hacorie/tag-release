import test from "ava";
import sinon from "sinon";
import { git } from "../helpers/index.js";
import { updateLog, __RewireAPI__ as RewireAPI } from "../../src/sequence-steps";

let utils = null;

function getUtils( methods = {} ) {
	return Object.assign( {}, {
		log: {
			begin: sinon.spy(),
			end: sinon.spy()
		},
		prompt: sinon.spy( command => new Promise( resolve => resolve( { log: true } ) ) ),
		editor: sinon.spy( command => new Promise( resolve => resolve( " commit " ) ) )
	}, methods );
}

test.beforeEach( t => {
	RewireAPI.__Rewire__( "logger", { log: sinon.stub() } );
	utils = getUtils();
	RewireAPI.__Rewire__( "utils", utils );
} );

test.afterEach( t => {
	RewireAPI.__ResetDependency__( "logger" );
	RewireAPI.__ResetDependency__( "utils" );
} );

test.serial( "updateLog should prompt the user to edit", t => {
	return updateLog( [ git, {} ] ).then( () => {
		t.truthy( utils.prompt.called );
	} );
} );

test.serial( "updateLog launches an editor if user wants to edit", t => {
	return updateLog( [ git, {} ] ).then( () => {
		t.truthy( utils.editor.called );
	} );
} );

test.serial( "updateLog calls log.begin", t => {
	return updateLog( [ git, {} ] ).then( () => {
		t.truthy( utils.log.begin.called );
	} );
} );

test.serial( "updateLog trims data from the editor", t => {
	const options = {};
	return updateLog( [ git, options ] ).then( () => {
		t.is( options.log, "commit" );
	} );
} );

test.serial( "updateShortlog calls log.end", t => {
	return updateLog( [ git, {} ] ).then( () => {
		t.truthy( utils.log.end.called );
	} );
} );

test.serial( "updateLog does not launch an editor if user declines", t => {
	RewireAPI.__ResetDependency__( "utils" );
	utils = getUtils( {
		prompt: sinon.spy( command => new Promise( resolve => resolve( { log: false } ) ) ),
		editor: sinon.spy( command => new Promise( resolve => resolve( " commit " ) ) )
	} );
	RewireAPI.__Rewire__( "utils", utils );
	return updateLog( [ git, {} ] ).then( () => {
		t.is( utils.editor.callCount, 0 );
	} );
} );
